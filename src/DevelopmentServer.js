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
const fse = require('fs-extra');
const path = require('path');
const express = require('express');
const proxyquire = require('proxyquire').noCallThru();
const ActionBuilder = require('./ActionBuilder');
const BaseConfig = require('./BaseConfig.js');

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
module.exports = class DevelopmentServer {
  /**
   * Creates a new development server using the given universal function.
   * @param {UniversalFunction} main - The universal function
   */
  constructor(main) {
    this._main = main;
    this._cwd = process.cwd();
    this._port = process.env.WEBSERVER_PORT || 3000;
  }

  withPort(value) {
    this._port = value;
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
    // load the action params params
    let pkgJson = {};
    try {
      pkgJson = await fse.readJson(path.resolve('package.json'));
    } catch (e) {
      // ignore
    }
    const config = new BaseConfig();
    if (pkgJson.wsk && pkgJson.wsk['params-file']) {
      config.withParamsFile(pkgJson.wsk['params-file']);
    }
    if (pkgJson.wsk && pkgJson.wsk.package && pkgJson.wsk.package['params-file']) {
      config.withParamsFile(pkgJson.wsk.package['params-file']);
    }
    if (pkgJson.wsk && pkgJson.wsk['dev-params-file']) {
      const file = pkgJson.wsk['dev-params-file'];
      if (await fse.exists(file)) {
        config.withParamsFile(file);
      }
    }
    const builder = new ActionBuilder().withConfig(config);
    await builder.validate();

    // use google adapter since it already supports express req/res types
    process.env.K_SERVICE = `${config.packageName}--${config.name}`;
    process.env.K_REVISION = config.version;
    this._handler = proxyquire('@adobe/helix-universal/src/google-adapter.js', {
      './main.js': {
        main: this._main,
      },
      './google-package-params.js': () => (config.params),
    });
    this.params = config.params;
    return this;
  }

  /**
   * Starts the development server
   * @returns {Promise<void>}
   */
  async start() {
    const app = express();
    app.use(rawBody());
    app.all('*', this._handler);
    await new Promise((resolve, reject) => {
      try {
        this.server = app.listen(this._port, () => {
          this._port = this.server.address().port;
          // eslint-disable-next-line no-console
          console.log(`Started development server on port ${this._port}`);
          resolve();
        });
      } catch (e) {
        reject(e);
      }
    });
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
};
