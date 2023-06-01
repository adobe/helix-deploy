/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import fse from 'fs-extra';
import path from 'path';
import express from 'express';
import { createAdapter } from '@adobe/helix-universal/aws';
import ActionBuilder from './ActionBuilder.js';
import BaseConfig from './BaseConfig.js';

function rawBody() {
  return (req, res, next) => {
    if (req.method === 'GET' || req.method === 'HEAD') {
      next();
      return;
    }
    const chunks = [];
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      req.rawBody = Buffer.concat(chunks);
      next();
    });
  };
}

function addRequestHeader(name, value) {
  return (req, res, next) => {
    req.headers[name] = value;
    next();
  };
}

/**
 * Development server for local development.
 *
 * Example:
 *
 * ```
 * // test/dev.js
 *
 * const { DevelopmentServer } = require('@adobe/helix-deploy');
 * const { main } = require('../src/index.js');
 *
 * async function run() {
 *  const devServer = await new DevelopmentServer(main).init();
 *  await devServer.start();
 * }
 *
 * run().then(process.stdout).catch(process.stderr);
 * ```
 *
 * @type {DevelopmentServer}
 */
export default class DevelopmentServer {
  /**
   * Creates a new development server using the given universal function.
   * @param {UniversalFunction} main - The universal function
   */
  constructor(main) {
    this._main = main;
    this._cwd = process.cwd();
    this._port = process.env.WEBSERVER_PORT || 3000;
    this._xfh = 'helix-pages.anywhere.run';
  }

  withPort(value) {
    this._port = value;
    return this;
  }

  withXFH(value) {
    this._xfh = value;
    return this;
  }

  withDirectory(value) {
    this._cwd = value;
    return this;
  }

  get port() {
    return this._port;
  }

  /**
   * Initializes the development server.
   * It uses the `wsk.package.params-file` and `wsk.params-file` to read the environment for
   * the action params.
   *
   * @returns this
   */
  async init() {
    // load the action params
    let pkgJson = {};
    try {
      pkgJson = await fse.readJson(path.resolve(this._cwd, 'package.json'));
    } catch (e) {
      // ignore
    }
    const config = new BaseConfig();
    if (pkgJson.wsk) {
      const withParamsFile = async (file) => {
        if (!file) {
          return;
        }
        // eslint-disable-next-line no-param-reassign
        const files = (Array.isArray(file) ? file : [file]).map((f) => path.resolve(this._cwd, f));
        await Promise.all(files.map(async (f) => {
          if (await fse.exists(f)) {
            config.withParamsFile(f);
          }
        }));
      };

      await withParamsFile(pkgJson.wsk?.package?.['params-file']);
      config.withParams(pkgJson.wsk?.package?.params);
      await withParamsFile(pkgJson.wsk?.['params-file']);
      config.withParams(pkgJson.wsk?.params);
      await withParamsFile(pkgJson.wsk?.dev?.['params-file']);
      config.withParams(pkgJson.wsk?.dev?.params);
    }

    const builder = new ActionBuilder().withConfig(config);
    await builder.validate();

    const region = process.env.AWS_REGION ?? 'us-east-1';
    const accountId = process.env.AWS_ACCOUNT_ID ?? 'no-account';

    const adapter = createAdapter({
      factory: () => (req, ctx) => {
        ctx.runtime.name = 'simulate';
        return this._main(req, ctx);
      },
    });
    this._handler = async (req, res) => {
      const [rawPath, rawQueryString = ''] = req.originalUrl.split('?');
      const event = {
        body: req.rawBody,
        headers: req.headers,
        pathParameters: {
          path: rawPath.substring(1),
        },
        requestContext: {
          domainName: req.hostname,
          http: {
            method: req.method,
          },
        },
        rawPath,
        rawQueryString,
      };
      const context = {
        invokedFunctionArn: `arn:aws:lambda:${region}:${accountId}:function:${config.name}:${config.version}`,
        getRemainingTimeInMillis: () => 60000,
      };

      const {
        statusCode,
        headers,
        isBase64Encoded,
        body,
      } = await adapter(event, context);

      res.status(statusCode);
      Object.entries(headers).forEach(([name, value]) => res.set(name, value));
      res.send(isBase64Encoded ? Buffer.from(body, 'base64') : body);
    };
    this.params = config.params;
    return this;
  }

  /**
   * Starts the development server
   * @returns {Promise<void>}
   */
  async start() {
    Object.entries(this.params).forEach(([key, value]) => {
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    });
    this.app = express();
    await new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this._port, () => {
          this._port = this.server.address().port;
          // eslint-disable-next-line no-console
          console.log(`Started development server at http://localhost:${this._port}/`);
          resolve();
        });
      } catch (e) {
        reject(e);
      }
    });
    this.app.use(rawBody());
    if (this._xfh) {
      this.app.use(addRequestHeader('x-forwarded-host', this._xfh.replace('{port}', this._port)));
    }
    this.app.all('*', this._handler);
  }

  /**
   * Stops the development server.
   * @returns {Promise<void>}
   */
  async stop() {
    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
