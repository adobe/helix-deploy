/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import archiver from 'archiver';
import chalk from 'chalk-template';

import {
  AddPermissionCommand,
  CreateFunctionCommand,
  GetFunctionCommand,
  UpdateFunctionCodeCommand,
} from '@aws-sdk/client-lambda';

import { CreateIntegrationCommand } from '@aws-sdk/client-apigatewayv2';

// eslint-disable-next-line no-underscore-dangle
const __dirname = path.resolve(fileURLToPath(import.meta.url), '..');

const FUNCTION_NAME = 'helix-deploy-proxy';

// packages served by the proxy, see the routes documented in src/template/aws-proxy-code.js
const ROUTE_PACKAGES = ['helix-services', 'helix3'];

/**
 * Deploys the shared `helix-deploy-proxy` Lambda function (src/template/aws-proxy-code.js)
 * and installs the routes it serves:
 *
 * ANY /helix-services/{action}/{version}
 * ANY /helix-services/{action}/{version}/{path+}
 * ANY /helix3/{action}/{version}
 * ANY /helix3/{action}/{version}/{path+}
 *
 * This is used to bootstrap a freshly created API, reusing the clients and route/integration
 * helpers of the owning AWSDeployer.
 */
export default class AWSProxyDeployer {
  /**
   * @param {AWSDeployer} awsDeployer the deployer that owns the AWS clients and config
   */
  constructor(awsDeployer) {
    this._deployer = awsDeployer;
  }

  get log() {
    return this._deployer.log;
  }

  // eslint-disable-next-line class-methods-use-this
  async buildZip() {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip');
      const chunks = [];
      archive.on('data', (chunk) => {
        chunks.push(chunk);
      });
      archive.on('error', (err) => {
        reject(err);
      });
      archive.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      archive.file(path.resolve(__dirname, '..', 'template', 'aws-proxy-code.js'), { name: 'index.mjs' });
      archive.finalize();
    });
  }

  async deployFunction() {
    const { _deployer: deployer, log } = this;
    const zipFile = await this.buildZip();

    let FunctionArn;
    try {
      log.info(chalk`--: checking existing proxy Lambda function {yellow ${FUNCTION_NAME}}`);
      // eslint-disable-next-line no-underscore-dangle
      const { Configuration } = await deployer._lambda.send(new GetFunctionCommand({
        FunctionName: FUNCTION_NAME,
      }));
      FunctionArn = Configuration.FunctionArn;
      await deployer.checkFunctionReady(FunctionArn);
      log.info(chalk`--: updating proxy Lambda function code {yellow ${FUNCTION_NAME}}`);
      // eslint-disable-next-line no-underscore-dangle
      await deployer._lambda.send(new UpdateFunctionCodeCommand({
        FunctionName: FUNCTION_NAME,
        ZipFile: zipFile,
      }));
    } catch (e) {
      if (e.name !== 'ResourceNotFoundException') {
        throw e;
      }
      log.info(chalk`--: creating proxy Lambda function {yellow ${FUNCTION_NAME}}`);
      // eslint-disable-next-line no-underscore-dangle
      const res = await deployer._lambda.send(new CreateFunctionCommand({
        FunctionName: FUNCTION_NAME,
        Runtime: `nodejs${deployer.cfg.nodeVersion}.x`,
        Handler: 'index.handler',
        Role: `arn:aws:iam::${deployer.accountId}:role/helix-role-deploy-proxy`,
        Description: 'Helix Deploy Proxy',
        Timeout: 60,
        Code: { ZipFile: zipFile },
      }));
      FunctionArn = res.FunctionArn;
    }
    await deployer.checkFunctionReady(FunctionArn);
    log.info(chalk`{green ok:} proxy function ready {yellow ${FunctionArn}}`);
    return FunctionArn;
  }

  async createRoutesAndPermissions(ApiId, FunctionArn) {
    const { _deployer: deployer, log } = this;

    let integration = await deployer.findIntegration(ApiId, FunctionArn);
    if (integration) {
      log.info(`--: using existing integration "${integration.IntegrationId}" for "${FunctionArn}"`);
    } else {
      // eslint-disable-next-line no-underscore-dangle
      integration = await deployer._api.send(new CreateIntegrationCommand({
        ApiId,
        IntegrationMethod: 'POST',
        IntegrationType: 'AWS_PROXY',
        IntegrationUri: FunctionArn,
        PayloadFormatVersion: '2.0',
        TimeoutInMillis: 30000,
      }));
      log.info(chalk`{green ok:} created new integration "${integration.IntegrationId}" for "${FunctionArn}"`);
    }

    const { IntegrationId } = integration;
    const routes = await deployer.fetchRoutes(ApiId);
    const routeParams = {
      ApiId,
      Target: `integrations/${IntegrationId}`,
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const pkg of ROUTE_PACKAGES) {
      // eslint-disable-next-line no-await-in-loop
      await deployer.createOrUpdateRoute(routes, routeParams, `ANY /${pkg}/{action}/{version}`);
      // eslint-disable-next-line no-await-in-loop
      await deployer.createOrUpdateRoute(routes, routeParams, `ANY /${pkg}/{action}/{version}/{path+}`);

      // eslint-disable-next-line no-underscore-dangle
      const sourceArn = `arn:aws:execute-api:${deployer._cfg.region}:${deployer._accountId}:${ApiId}/*/*/${pkg}/*`;
      try {
        // eslint-disable-next-line no-await-in-loop,no-underscore-dangle
        await deployer._lambda.send(new AddPermissionCommand({
          FunctionName: FunctionArn,
          Action: 'lambda:InvokeFunction',
          SourceArn: sourceArn,
          Principal: 'apigateway.amazonaws.com',
          StatementId: crypto.createHash('md5').update(FunctionArn + sourceArn).digest('hex'),
        }));
        log.info(chalk`{green ok:} added invoke permissions for ${sourceArn}`);
      } catch (e) {
        // ignore, most likely the permission already exists
      }
    }
  }

  async deploy(ApiId) {
    const FunctionArn = await this.deployFunction();
    await this.createRoutesAndPermissions(ApiId, FunctionArn);
  }
}
