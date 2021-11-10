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
const FormData = require('form-data');
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
    return !!this._cfg.auth && !!this._cfg.accountID && !!this.cfg.edgeBundle;
  }

  validate() {
    if (!this.ready()) {
      throw new Error('Cloudflare target needs email, token, and account ID');
    }
  }

  get fullFunctionName() {
    return `${this.cfg.packageName}--${this.cfg.name}`
      .replace(/\./g, '_')
      .replace('@', '_');
  }

  async deploy() {
    const body = fs.readFileSync(path.relative(this.cfg.cwd, this.cfg.edgeBundle));
    const { id } = await this.createKVNamespace(`${this.cfg.packageName}--secrets`);

    const metadata = {
      body_part: 'script',
      bindings: [
        ...Object.entries(this.cfg.params).map(([key, value]) => ({
          name: key,
          type: 'secret_text',
          text: value,
        })),
        {
          name: 'PACKAGE',
          namespace_id: id,
          type: 'kv_namespace',
        },
      ],
    };

    // what https://api.cloudflare.com/#worker-script-upload-worker won't tell you:
    // you can use multipart/formdata to set metadata according to
    // https://community.cloudflare.com/t/bind-kv-and-workers-via-api/221391
    const form = new FormData();
    form.append('script', body, {
      contentType: 'application/javascript',
    });
    form.append('metadata', JSON.stringify(metadata), {
      contentType: 'application/json',
    });

    const res = await this.fetch(`https://api.cloudflare.com/client/v4/accounts/${this._cfg.accountID}/workers/scripts/${this.fullFunctionName}`, {
      method: 'PUT',
      headers: form.getHeaders({
        Authorization: `Bearer ${this._cfg.auth}`,
      }),
      body: form.getBuffer(),
    });

    if (!res.ok) {
      const { errors } = await res.json();
      throw new Error(`Unable to upload worker to Cloudflare: ${errors[0].message}`);
    }

    await this.updatePackageParams(id, this.cfg.packageParams);
  }

  async updatePackageParams(id, params) {
    const kvlist = Object.entries(params).map(([key, value]) => ({
      key, value,
    }));

    const res = await this.fetch(`https://api.cloudflare.com/client/v4/accounts/${this._cfg.accountID}/storage/kv/namespaces/${id}/bulk`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this._cfg.auth}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(kvlist),
    });
    return res.ok;
  }

  async createKVNamespace(name) {
    const postres = await this.fetch(`https://api.cloudflare.com/client/v4/accounts/${this._cfg.accountID}/storage/kv/namespaces`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this._cfg.auth}`,
        'content-type': 'application/json',
      },
      body: {
        title: name,
      },
    });
    let { result } = await postres.json();
    if (!result) {
      const listres = await this.fetch(`https://api.cloudflare.com/client/v4/accounts/${this._cfg.accountID}/storage/kv/namespaces`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this._cfg.auth}`,
        },
      });
      const { result: results } = await listres.json();
      result = results.find((r) => r.title === name);
    }
    return result;
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
