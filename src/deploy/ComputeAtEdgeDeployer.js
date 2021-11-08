/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
const { fork } = require('child_process');
const path = require('path');
const fs = require('fs/promises');
const tar = require('tar');
const getStream = require('get-stream');
const Fastly = require('@adobe/fastly-native-promises');
const BaseDeployer = require('./BaseDeployer');
const ComputeAtEdgeConfig = require('./ComputeAtEdgeConfig');

/**
 * The class ComputeAtEdgeDeployer deploys to Fastly's Compute(at)Edge (WASM) runtime.
 * It should be seen as a functional equivalent to the CloudflareDeployer
 * and not confused with the FastlyGateway (which only routes requests, but
 * does not handle them.)
 */
class ComputeAtEdgeDeployer extends BaseDeployer {
  constructor(baseConfig, config) {
    super(baseConfig);
    Object.assign(this, {
      id: 'c@e',
      name: 'Fastly Compute@Edge',
      _cfg: config,
      _fastly: null,
    });
  }

  ready() {
    return !!this._cfg.service && !!this._cfg.auth;
  }

  validate() {
    if (!this.ready()) {
      throw new Error('Compute@Edge target needs token and service ID');
    }
  }

  init() {
    if (this.ready() && !this._fastly) {
      this._fastly = Fastly(this._cfg.auth, this._cfg.service);
    }
  }

  get log() {
    return this.cfg.log;
  }

  /**
   *
   * @returns
   */
  async bundle() {
    const bundleDir = path.dirname(this.cfg.edgeBundle);
    this.log.debug(`Creating fastly.toml in ${bundleDir}`);
    fs.writeFile(path.resolve(bundleDir, 'fastly.toml'), `
# This file describes a Fastly Compute@Edge package. To learn more visit:
# https://developer.fastly.com/reference/fastly-toml/

authors = ["Helix Deploy"]
description = "Test Project"
language = "javascript"
manifest_version = 2
name = "Test"
service_id = ""
    `);

    return new Promise((resolve, reject) => {
      const child = fork(
        path.resolve(__dirname,
          '..',
          '..',
          'node_modules',
          '@fastly',
          'js-compute',
          'js-compute-runtime-cli.js'),
        [this.cfg.edgeBundle, 'bin/main.wasm'],
        {
          cwd: bundleDir,
        },
      );
      child.on('data', (data) => resolve(data));
      child.on('error', (err) => reject(err));
      child.on('close', (err) => {
        if (err) {
          // non-zero status code
          reject(err);
        } else {
          this.log.debug(`Created WASM bundle of script and interpreter in ${bundleDir}/bin/main.wasm`);
          const stream = tar.c({
            gzip: true,
            // sync: true,
            cwd: bundleDir,
            prefix: 'Test',
            // file: path.resolve(bundleDir, 'fastly-bundle.tar.gz')
          }, ['bin/main.wasm', 'fastly.toml']);
          // this.log.debug(`Created tar file in ${bundleDir}/fastly-bundle.tar.gz`);
          resolve(getStream.buffer(stream));
        }
      });
    });
  }

  async deploy() {
    const buf = await this.bundle();

    this.init();

    await this._fastly.transact(async (version) => {
      await this._fastly.writePackage(version, buf);
    }, true);
  }
}

ComputeAtEdgeDeployer.Config = ComputeAtEdgeConfig;
module.exports = ComputeAtEdgeDeployer;
