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
const msRestNodeAuth = require('@azure/ms-rest-nodeauth');
const { WebSiteManagementClient } = require('@azure/arm-appservice');
const { context, ALPN_HTTP1_1 } = require('@adobe/helix-fetch');
const fs = require('fs');
const BaseDeployer = require('./BaseDeployer');
const AzureConfig = require('./AzureConfig.js');

const { fetch } = context({
  // TODO: why is HTTP/1.1 enforced?
  alpnProtocols: [ALPN_HTTP1_1],
});

class AzureDeployer extends BaseDeployer {
  constructor(baseConfig, config) {
    super(baseConfig);
    Object.assign(this, {
      id: 'azure',
      name: 'Azure',
      _cfg: config,
      _auth: null,
      _pubcreds: null,
    });
  }

  ready() {
    return !!this._cfg.appName && !!this._auth;
  }

  validate() {
    if (!this.ready()) {
      throw Error('Azure target needs --azure-app');
    }
  }

  // eslint-disable-next-line class-methods-use-this
  get basePath() {
    return '/api';
  }

  // eslint-disable-next-line class-methods-use-this
  get customVCL() {
    // fix azure's blob handling
    // todo: more comprehensive regex of commonly uploaded mime types
    return `if (req.http.content-type != "" && req.http.content-type ~ "^(image)/.*") {
      set req.http.x-backup-content-type = req.http.content-type;
      set req.http.content-type = "application/octet-stream";
    }`;
  }

  async init() {
    const clientId = process.env.AZURE_CLIENT_ID;
    const secret = process.env.AZURE_CLIENT_SECRET;
    const tenantId = process.env.AZURE_TENANT_ID;

    if (!!clientId && !!secret && !!tenantId && !!this._cfg.appName) {
      try {
        const res = await msRestNodeAuth.loginWithServicePrincipalSecretWithAuthResponse(
          clientId,
          secret,
          tenantId,
        );
        this._auth = res;

        const subscription = process.env.AZURE_SUBSCRIPTION_ID || this._auth.subscriptions[0].id;

        this._client = new WebSiteManagementClient(
          this._auth.credentials,
          subscription,
        );
        const [apps] = (await this._client.webApps.list()).filter(
          (app) => app.name === this._cfg.appName,
        );
        this._app = apps;

        this._pubcreds = await this._client.webApps.listPublishingCredentials(
          this._app.resourceGroup,
          this._cfg.appName,
        );
      } catch (e) {
        this.log.error(`Unable to authenticate with Azure:${e.message}`);
        throw e;
      }
    }
  }

  async uploadFunctionZIP() {
    const { cfg } = this;
    const funcname = `${cfg.packageName}--${cfg.name}`.replace('@', '_').replace('.', '_');
    const url = new URL(
      `${this._pubcreds.scmUri}/api/zip/site/wwwroot/${funcname}/`,
    ).href.replace(/https:\/\/.*?@/, 'https://');
    // const url = new URL(this._pubcreds.scmUri + `/api/zip/site/wwwroot/${'newfunc'.replace('/', '--')}/`).href.replace(/https:\/\/.*?@/, 'https://');
    const body = fs.createReadStream(cfg.zipFile);
    const authorization = `Basic ${Buffer.from(
      `${this._pubcreds.publishingUserName
      }:${
        this._pubcreds.publishingPassword}`,
    ).toString('base64')}`;

    this.log.info(`--: uploading ${this.relZip} to Azure bucket ${url} ...`);

    const resp = await fetch(url, {
      method: 'PUT',
      body,
      headers: {
        authorization,
      },
    });
    if (resp.ok) {
      this.log.info(`File uploaded ${await resp.text()}`);
    } else {
      throw new Error(
        `File upload failed (${resp.status}): ${await resp.text()}`,
      );
    }
  }

  async updateParams() {
    const { cfg } = this;
    this.log.info('--: updating function parameters ...');
    const funcname = `${cfg.packageName}--${cfg.name}`.replace('@', '_').replace('.', '_');
    const url = new URL(
      `${this._pubcreds.scmUri}/api/vfs/site/wwwroot/${funcname}/params.json`,
    ).href.replace(/https:\/\/.*?@/, 'https://');

    const authorization = `Basic ${Buffer.from(
      `${this._pubcreds.publishingUserName
      }:${
        this._pubcreds.publishingPassword}`,
    ).toString('base64')}`;

    let params = {};
    let ifmatch = '*';
    try {
      const prereq = await fetch(url, {
        method: 'GET',
        headers: {
          authorization,
        },
      });
      ifmatch = prereq.headers.get('ETag');
      params = prereq.json();
    } catch (err) {
      this.log.warn('Unable to get existing function parameters, starting from scratch.');
    }

    const resp = await fetch(url, {
      method: 'PUT',
      body: JSON.stringify({
        ...cfg.params,
        ...params,
      }),
      headers: {
        authorization,
        'Content-Type': 'application/json',
        'If-Match': ifmatch,
      },
    });

    if (resp.ok) {
      this.log.info(`Params updated ${await resp.text()}`);
    } else {
      throw new Error(
        `Parameter update failed (${resp.status}): ${await resp.text()}`,
      );
    }
  }

  async updatePackage() {
    const { cfg } = this;
    this.log.info('--: updating app (package) parameters ...');
    const url = new URL(
      `${this._pubcreds.scmUri}/api/settings`,
    ).href.replace(/https:\/\/.*?@/, 'https://');

    const authorization = `Basic ${Buffer.from(
      `${this._pubcreds.publishingUserName
      }:${
        this._pubcreds.publishingPassword}`,
    ).toString('base64')}`;

    const resp = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(cfg.packageParams),
      headers: {
        authorization,
        'Content-Type': 'application/json',
      },
    });

    this.log.info(resp.status, await resp.text());
  }

  async deploy() {
    try {
      await this.uploadFunctionZIP();
      await this.updateParams();
    } catch (err) {
      this.log.error(`Unable to update Azure function: ${err.message}`);
      throw err;
    }
  }
}

AzureDeployer.Config = AzureConfig;
module.exports = AzureDeployer;
