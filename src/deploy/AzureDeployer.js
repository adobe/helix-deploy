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
const BaseDeployer = require('./BaseDeployer');

class AzureDeployer extends BaseDeployer {
  constructor(builder) {
    super(builder);

    Object.assign(this, {
      _appName: '',
      _auth: null,
    });
  }

  ready() {
    return !!this._appName && !!this._auth;
  }

  withAzureApp(value) {
    this._appName = value;
    return this;
  }

  async init() {
    const clientId = process.env.AZURE_CLIENT_ID;
    const secret = process.env.AZURE_CLIENT_SECRET;
    const tenantId = process.env.AZURE_TENANT_ID;

    if (!!clientId && !!secret && !!tenantId && !!this._appName) {
      try {
        let res = await msRestNodeAuth.loginWithServicePrincipalSecretWithAuthResponse(
          clientId,
          secret,
          tenantId,
        );
        console.log(res);
        this._auth = res;

        const subscription = process.env.AZURE_SUBSCRIPTION_ID || this._auth.subscriptions[0].id;

        this._client = new WebSiteManagementClient(this._auth.credentials, subscription);
        const [apps] = (await this._client.webApps.list())
          .filter((app) => app.name === this._appName);
        this._app = apps;

        res = await this._client.webApps.listFunctions(this._app.resourceGroup, this._appName);
        console.log(res);
      } catch (e) {
        this.log.error(`Unable to authenticate with Azure:${e.message}`);
        throw e;
      }
    }
  }
}

module.exports = AzureDeployer;
