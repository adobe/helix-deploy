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
/* eslint-disable no-underscore-dangle */
const fse = require('fs-extra');
const path = require('path');
const ActionBuilder = require('./action_builder.js');

/**
 * Development server to use with a expressified openwhisk app.
 *
 * Example:
 *
 * ```
 * // test/dev.js
 *
 * const { DevelopmentServer } = require('@adobe/openwhisk-action-builder');
 * const App = require('../src/app.js');
 *
 * async function run() {
 *  const devServer = await new DevelopmentServer(App).init();
 *  return devServer.start();
 * }
 * run().catch(console.error);
 * ```
 *
 * @type {DevelopmentServer}
 */
module.exports = class DevelopmentServer {
  /**
   * Creates a new development server using the given express app.
   * @param {function} appFn - The function that creates an express app.
   */
  constructor(appFn) {
    this._appFn = appFn;
    this._cwd = process.cwd();
    this._port = process.env.WEBSERVER_PORT || 3000;
  }

  withPort(value) {
    this._port = value;
    return this;
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
    const builder = new ActionBuilder();
    if (pkgJson.wsk && pkgJson.wsk['params-file']) {
      builder.withParamsFile(pkgJson.wsk['params-file']);
    }
    if (pkgJson.wsk && pkgJson.wsk.package && pkgJson.wsk.package['params-file']) {
      builder.withParamsFile(pkgJson.wsk.package['params-file']);
    }
    if (pkgJson.wsk && pkgJson.wsk['dev-params-file']) {
      const file = pkgJson.wsk['dev-params-file'];
      if (await fse.exists(file)) {
        builder.withParamsFile(file);
      }
    }
    await builder._deployers.openwhisk.init();

    const params = await ActionBuilder.resolveParams(builder._params);

    // set openwhisk coordinates for transparent ow client usage.
    process.env.__OW_API_KEY = builder._deployers.openwhisk._wskAuth;
    process.env.__OW_API_HOST = builder._deployers.openwhisk._wskApiHost;
    process.env.__OW_NAMESPACE = builder._deployers.openwhisk._wskNamespace;

    this.params = params;
    return this;
  }

  /**
   * Starts the development server
   * @returns {Promise<void>}
   */
  async start() {
    const app = await this._appFn(this.params);

    // bind default params like expressify does
    Object.defineProperty(app.request, 'owActionParams', {
      value: this.params,
      enumerable: false,
    });

    await new Promise((resolve, reject) => {
      try {
        this.server = app.listen(this._port, () => {
          // eslint-disable-next-line no-console
          console.log(`Started development server on port ${this.server.address().port}`);
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
