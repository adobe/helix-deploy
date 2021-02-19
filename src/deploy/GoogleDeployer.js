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
const { CloudFunctionsServiceClient } = require('@google-cloud/functions');
const path = require('path');
const fs = require('fs');
const { context } = require('@adobe/helix-fetch');
const BaseDeployer = require('./BaseDeployer');
const GoogleConfig = require('./GoogleConfig.js');

const { fetch } = context();

class GoogleDeployer extends BaseDeployer {
  constructor(baseConfig, config) {
    super(baseConfig);
    Object.assign(this, {
      id: 'google',
      name: 'Google',
      _cfg: config,
      _client: null,
    });
  }

  ready() {
    return !!this._client;
  }

  validate() {
    if (!this.ready()) {
      throw new Error('Google target needs key file, email, and project ID');
    }
  }

  async init() {
    try {
      this._client = new CloudFunctionsServiceClient({
        email: this._cfg.email,
        keyFilename: path.resolve(process.cwd, this._cfg.keyFile),
        projectId: this._cfg.projectID,
      });
    } catch (e) {
      this.log.error(`Unable to authenticate with Google: ${e.message}`);
      throw e;
    }
  }

  async uploadZIP() {
    const [{ uploadUrl }] = await this._client.generateUploadUrl({
      parent: `projects/${this._cfg.projectID}/locations/us-central1`,
    });

    const body = fs.createReadStream(this.cfg.zipFile);

    // upload
    await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/zip',
        'x-goog-content-length-range': '0,104857600',
      },
      body,
    });

    this._uploadURL = uploadUrl;
  }

  get fullFunctionName() {
    return `${this.cfg.packageName}--${this.cfg.name}`
      .replace(/\./g, '_')
      .replace('@', '_');
  }

  async createFunction() {
    const name = `projects/${this._cfg.projectID}/locations/us-central1/functions/${this.fullFunctionName}`;
    let exists = false;

    try {
      await this._client.getFunction({
        name,
      });
      exists = true;
    } catch {
      exists = false;
    }

    try {
      const func = {
        name,
        serviceAccountEmail: this._cfg.email,
        description: 'Just testing',
        entryPoint: 'google',
        runtime: 'nodejs12',
        httpsTrigger: {},
        sourceUploadUrl: this._uploadURL,
      };

      if (exists) {
        const [op] = await this._client.updateFunction({
          // location: `projects/${this._cfg.projectID}/locations/us-central1`,
          function: func,
        });

        this.log.info('updating existing function');
        const [res] = await op.promise();
        this._function = res;
        this.log.info('function deployed');
      } else {
        const [op] = await this._client.createFunction({
          location: `projects/${this._cfg.projectID}/locations/us-central1`,
          function: func,
        });

        this.log.info('creating function, please wait (Google deployments are slow).');
        const [res] = await op.promise();
        this._function = res;
        this.log.info('function deployed');
      }

      this.log.info('enabling unauthenticated requests');
      await this._client.setIamPolicy({
        resource: name,
        policy: {
          bindings: [
            {
              role: 'roles/cloudfunctions.invoker',
              members: [
                'allUsers',
              ],
            },
          ],
        },
      });
    } catch (err) {
      this.log.error(err);
      // eslint-disable-next-line max-len
      // this.log.error('bad request:', err.metadata.internalRepr.get('google.rpc.badrequest-bin').toString());
      // eslint-disable-next-line max-len
      // this.log.error('details:', err.metadata.internalRepr.get('grpc-status-details-bin').toString());
      throw err;
    }

    this._functionURL = this._function.httpsTrigger.url;
  }

  async deploy() {
    try {
      await this.uploadZIP();
      await this.createFunction();
    } catch (err) {
      this.log.error(`Unable to deploy Google Cloud function: ${err.message}`, err);
      throw err;
    }
  }

  async test() {
    let url = this._functionURL;
    if (!url) {
      url = `https://us-central1-${this._cfg.projectID}.cloudfunctions.net/${this.fullFunctionName}`;
    }
    return this.testRequest({
      url,
      idHeader: 'X-Cloud-Trace-Context',
      retry404: 1,
    });
  }
}

GoogleDeployer.Config = GoogleConfig;
module.exports = GoogleDeployer;
