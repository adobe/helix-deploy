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

import {
  CreateRoleCommand,
  GetRoleCommand,
  PutRolePolicyCommand,
} from '@aws-sdk/client-iam';

// eslint-disable-next-line no-underscore-dangle
const __dirname = path.resolve(fileURLToPath(import.meta.url), '..');

const FUNCTION_NAME = 'helix-deploy-proxy';
const ROLE_NAME = 'helix-role-deploy-proxy';
const ROLE_POLICY_NAME = 'helix-policy-deploy-proxy';

// packages served by the proxy, see the routes documented in src/template/aws-proxy-code.js
const ROUTE_PACKAGES = ['helix-services', 'helix3'];

// trust policy allowing Lambda to assume the proxy role
const ROLE_TRUST_POLICY = {
  Version: '2012-10-17',
  Statement: [
    {
      Effect: 'Allow',
      Principal: {
        Service: 'lambda.amazonaws.com',
      },
      Action: 'sts:AssumeRole',
    },
  ],
};

// permissions granted to the proxy role. the `ACCOUNT_ID` placeholder is replaced
// with `deployer.accountId` before the policy is attached (see createRole()).
const ROLE_PERMISSIONS_POLICY = {
  Version: '2012-10-17',
  Statement: [
    {
      Sid: 'BasicExecutionLogs',
      Effect: 'Allow',
      Action: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
      ],
      Resource: `arn:aws:logs:*:ACCOUNT_ID:log-group:/aws/lambda/${FUNCTION_NAME}:*`,
    },
    {
      Sid: 'LambdaInvoke',
      Effect: 'Allow',
      Action: [
        'lambda:InvokeFunction',
        'lambda:InvokeAsync',
      ],
      Resource: 'arn:aws:lambda:*:ACCOUNT_ID:function:*',
    },
    {
      Sid: 'PackageSecretsReadOnly',
      Effect: 'Allow',
      Action: [
        'secretsmanager:GetSecretValue',
        'secretsmanager:DescribeSecret',
      ],
      Resource: 'arn:aws:secretsmanager:*:ACCOUNT_ID:secret:/helix-deploy/*',
    },
  ],
};

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

  /**
   * Creates the `helix-role-deploy-proxy` IAM role used by the proxy Lambda function, unless it
   * already exists. The role is created with a trust policy allowing Lambda to assume it and an
   * inline permissions policy granting logging, lambda invoke and read-only access to the
   * `/helix-deploy/*` secrets.
   *
   * @returns {Promise<string>} the ARN of the role
   */
  async createRole() {
    const { _deployer: deployer, log } = this;

    try {
      log.info(chalk`--: checking existing proxy role {yellow ${ROLE_NAME}}`);
      const { Role } = await deployer.iam.send(new GetRoleCommand({
        RoleName: ROLE_NAME,
      }));
      log.info(chalk`{green ok:} using existing proxy role {yellow ${Role.Arn}}`);
      return Role.Arn;
    } catch (e) {
      if (e.name !== 'NoSuchEntityException') {
        throw e;
      }
    }

    log.info(chalk`--: creating proxy role {yellow ${ROLE_NAME}}`);
    const { Role } = await deployer.iam.send(new CreateRoleCommand({
      RoleName: ROLE_NAME,
      AssumeRolePolicyDocument: JSON.stringify(ROLE_TRUST_POLICY),
      Description: 'Helix Deploy Proxy',
    }));

    const permissions = JSON.stringify(ROLE_PERMISSIONS_POLICY)
      .replace(/ACCOUNT_ID/g, deployer.accountId);
    await deployer.iam.send(new PutRolePolicyCommand({
      RoleName: ROLE_NAME,
      PolicyName: ROLE_POLICY_NAME,
      PolicyDocument: permissions,
    }));

    log.info(chalk`{green ok:} created proxy role {yellow ${Role.Arn}}`);
    return Role.Arn;
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
        Role: `arn:aws:iam::${deployer.accountId}:role/${ROLE_NAME}`,
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
    await this.createRole();
    const FunctionArn = await this.deployFunction();
    await this.createRoutesAndPermissions(ApiId, FunctionArn);
  }
}
