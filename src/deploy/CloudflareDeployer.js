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
const path = require('path');
const fs = require('fs');
const BaseDeployer = require('./BaseDeployer');
const CloudflareConfig = require('./CloudflareConfig');

class CloudflareDeployer extends BaseDeployer {
  constructor(baseConfig, config) {
    super(baseConfig);
    Object.assign(this, {
      id: 'cloudflare',
      name: 'Cloudflare',
      _cfg: config,
    });
  }

  ready() {
    return !!this._cfg.auth && !!this._cfg.accountID;
  }

  validate() {
    if (!this.ready()) {
      throw new Error('Cloudflare target needs email, token, and account ID');
    }
  }

  async init() {
    this.log.debug('Cloudflare Deployer ready');
    // nothing to do here
  }

  get fullFunctionName() {
    return `${this.cfg.packageName}--${this.cfg.name}`
      .replace(/\./g, '_')
      .replace('@', '_');
  }

  async deploy() {
    const body = fs.createReadStream(path.relative(this.cfg.cwd, this.cfg.edgeBundle));

    const res = await this.fetch(`https://api.cloudflare.com/client/v4/accounts/${this._cfg.accountID}/workers/scripts/${this.fullFunctionName}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this._cfg.auth}`,
        'content-type': 'application/javascript',
      },
      body,
    });

    if (!res.ok) {
      const { errors } = await res.json();
      throw new Error(`Unable to upload worker to Cloudflare: ${errors[0].message}`);
    }
  }

  async test() {
    return this._cfg.testDomain
      ? this.testRequest({
        url: `https://${this.fullFunctionName}.${this._cfg.testDomain}.workers.dev`,
        idHeader: 'CF-RAY',
        retry404: 0,
      })
      : undefined;
  }
}

CloudflareDeployer.Config = CloudflareConfig;
module.exports = CloudflareDeployer;
