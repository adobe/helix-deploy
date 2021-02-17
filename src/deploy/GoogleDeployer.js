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
const { CloudFunctionsServiceClient, CloudFunction } = require('@google-cloud/functions');
const path = require('path');
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
    return (!!this._cfg.projectID && !!this._cfg.keyFile && !!this._cfg.email)
      || (!!this._cfg.keyFile && this._cfg.keyFile.endsWith('.json'))
      || (!!this._cfg.keyFile && this._cfg.keyFile.endsWith('.p12') && !!this._cfg.email)
      || (!!this._cfg.keyFile && this._cfg.keyFile.endsWith('.pem') && !!this._cfg.email);
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
    const targetURL = await this._client.generateUploadUrl({
      parent: `projects/${this._cfg.projectId}/locations/helix-deploy`,
    });

    await fetch(targetURL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/zip',
        'x-goog-content-length-range': '0,104857600',
      },
    });

    this._uploadURL = targetURL;
  }

  get fullFunctionName() {
    return `${this.cfg.packageName}--${this.cfg.name}`;
  }

  async createFunction() {
    const [existing] = await this._client.getFunction({
      name: this.fullFunctionName(),
    });

    if (!existing) {
      const op = await this._client.createFunction(`projects/${this._cfg.projectId}/locations/${this.fullFunctionName}`,
        new CloudFunction({
          // https://cloud.google.com/functions/docs/reference/rest/v1/projects.locations.functions#CloudFunction
          description: 'Created by helix-deploy',
          name: this.fullFunctionName,
          entryPoint: 'google',
          runtime: 'nodejs12', // TODO: configurable
          sourceUploadUrl: this._uploadURL,
        }));
      const res = await this._client.checkCreateFunctionProgress(op);
      this.log.info(op, res);
    } else {
      this.log.info('Function needs to be updated');
    }
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
}

GoogleDeployer.Config = GoogleConfig;
module.exports = GoogleDeployer;
