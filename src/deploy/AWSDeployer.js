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
/* eslint-disable no-await-in-loop,no-restricted-syntax */
import chalk from 'chalk-template';
import processQueue from '@adobe/helix-shared-process-queue';

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import {
  GetCallerIdentityCommand,
  STSClient,
} from '@aws-sdk/client-sts';

import {
  AddPermissionCommand,
  CreateAliasCommand,
  CreateFunctionCommand, DeleteAliasCommand, DeleteFunctionCommand, GetAliasCommand,
  GetFunctionCommand,
  LambdaClient, ListAliasesCommand, ListVersionsByFunctionCommand,
  PublishVersionCommand, UpdateAliasCommand, UpdateFunctionCodeCommand,
  UpdateFunctionConfigurationCommand,
} from '@aws-sdk/client-lambda';

import {
  ApiGatewayV2Client,
  CreateApiCommand, CreateAuthorizerCommand,
  CreateIntegrationCommand, CreateRouteCommand,
  CreateStageCommand,
  DeleteIntegrationCommand,
  GetApiCommand,
  GetApisCommand, GetAuthorizersCommand,
  GetIntegrationsCommand, GetRoutesCommand,
  GetStagesCommand, UpdateAuthorizerCommand, UpdateRouteCommand,
} from '@aws-sdk/client-apigatewayv2';

import { PutParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

import { PutSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

import path from 'path';
import fse from 'fs-extra';
import crypto from 'crypto';
import BaseDeployer from './BaseDeployer.js';
import ActionBuilder from '../ActionBuilder.js';
import AWSConfig from './AWSConfig.js';

const API_GW_NAME_DEFAULT = 'API Managed by Helix Deploy';

export default class AWSDeployer extends BaseDeployer {
  /**
   * @param {BaseConfig} baseConfig
   * @param {AWSConfig} config
   */
  constructor(baseConfig, config) {
    super(baseConfig);

    Object.assign(this, {
      id: 'aws',
      name: 'AmazonWebServices',
      /** @type AWSConfig */
      _cfg: config,
      _functionARN: '',
      _aliasARN: '',
      _accountId: '',
    });
  }

  ready() {
    return !!this._cfg.region
      && !!this._cfg.apiId
      && !!this._cfg.role
      && !!this._s3
      && !!this._lambda
      && !!this._ssm;
  }

  get host() {
    return `${this._cfg.apiId}.execute-api.${this._cfg.region}.amazonaws.com`;
  }

  // eslint-disable-next-line class-methods-use-this
  get urlVCL() {
    return '"/" + var.package + "/" + var.action + var.slashversion + var.rest';
  }

  get functionPath() {
    if (!this._functionPath) {
      const { cfg } = this;
      this._functionPath = ActionBuilder.substitute(cfg.format.aws, { ...cfg, ...cfg.properties });
    }
    return this._functionPath;
  }

  get functionName() {
    if (!this._functionName) {
      const { cfg } = this;
      this._functionName = ActionBuilder.substitute(this._cfg.lambdaFormat, { ...cfg, ...cfg.properties }).replace(/\./g, '_');
    }
    return this._functionName;
  }

  get basePath() {
    return `${this.functionPath}`;
  }

  // eslint-disable-next-line class-methods-use-this
  get customVCL() {
    // https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-request-tracing.html
    // set X-Amzn-Trace-Id (tracing from x-cdn-request-id)
    return `if (req.http.x-cdn-request-id != "") {
      # aws trace id: root/self + version + timestamp + id (stripped of dashes)
      set req.http.X-Amzn-Trace-Id = "Root=1" + now.sec + req.http.x-cdn-request-id;
    }`;
  }

  validate() {
    const req = [];
    if (!this._cfg.role) {
      req.push('--aws-role');
    }
    if (!this._cfg.region) {
      req.push('--aws-region');
    }
    if (req.length) {
      throw Error(`AWS target needs ${req.join(' and ')}`);
    }
  }

  async init() {
    if (this._cfg.region) {
      this._s3 = new S3Client({
        region: this._cfg.region,
      });
      this._lambda = new LambdaClient({
        region: this._cfg.region,
      });
      this._api = new ApiGatewayV2Client({
        region: this._cfg.region,
      });
      this._ssm = new SSMClient({
        region: this._cfg.region,
      });
      this._sm = new SecretsManagerClient({
        region: this._cfg.region,
      });
    }
  }

  async initAccountId() {
    let sts;

    try {
      sts = new STSClient({
        region: this._cfg.region,
      });
      const ret = await sts.send(new GetCallerIdentityCommand());
      this._accountId = ret.Account;
      this.log.info(chalk`{green ok:} initialized AWS deployer for account {yellow ${ret.Account}}`);
    } finally {
      sts.destroy();
    }
  }

  async uploadZIP() {
    const { cfg } = this;
    const relZip = path.relative(process.cwd(), cfg.zipFile);

    // ensure upload key is unique
    this._bucket = this._cfg.deployBucket || `helix-deploy-bucket-${this._accountId}`;
    this._key = `${path.basename(relZip)}-${crypto.randomBytes(16).toString('hex')}`;
    const uploadParams = {
      Bucket: this._bucket,
      Key: this._key,
      Body: await fse.readFile(cfg.zipFile),
    };

    this.log.info(chalk`--: uploading ${relZip} to S3 bucket {blueBright s3://${this._bucket}}...`);
    try {
      await this._s3.send(new PutObjectCommand(uploadParams));
      this.log.info(chalk`{green ok:} uploaded deploy package {blueBright s3://${this._bucket}/${this._key}}`);
    } catch (e) {
      this.log.error(chalk`{red error:} failed to update package to {blueBright s3://${this._bucket}/${this._key}}: ${e.message}`);
      throw new Error('upload failed');
    }
  }

  async deleteZIP() {
    await this._s3.send(new DeleteObjectCommand({
      Bucket: this._bucket,
      Key: this._key,
    }));
    this.log.info(chalk`{green ok:} deleted deploy package {blueBright s3://${this._bucket}/${this._key}}.`);
  }

  async createLambda() {
    const { cfg, functionName } = this;
    const functionVersion = cfg.version.replace(/\./g, '_');

    const functionConfig = {
      Code: {
        S3Bucket: this._bucket,
        S3Key: this._key,
      },
      // todo: package name
      FunctionName: functionName,
      Role: this._cfg.role,
      Runtime: `nodejs${cfg.nodeVersion}.x`,
      // todo: cram annotations into description?
      Tags: {
        pkgVersion: cfg.version,
        // AWS tags have a size limit of 256. currently disabling
        // dependencies: cfg.dependencies.main
        //   .map((dep) => `${dep.name}:${dep.version}`).join(','),
        repository: encodeURIComponent(cfg.gitUrl).replace(/%/g, '@'),
        git: encodeURIComponent(`${cfg.gitOrigin}#${cfg.gitRef}`).replace(/%/g, '@'),
        updated: `${cfg.updatedAt}`,
      },
      Description: cfg.pkgJson.description,
      MemorySize: cfg.memory,
      Timeout: Math.floor(cfg.timeout / 1000),
      Environment: {
        Variables: cfg.params,
      },
      Handler: cfg.esm ? 'esm-adapter/index.handler' : 'index.lambda',
      Architectures: [
        this._cfg.arch,
      ],
      LoggingConfig: this._cfg.logFormat ? { Format: this._cfg.logFormat } : undefined,
      Layers: this._cfg.layers,
      TracingConfig: this._cfg.tracingMode ? { Mode: this._cfg.tracingMode } : undefined,
    };

    this.log.info(`--: using lambda role "${this._cfg.role}"`);

    // check if function already exists
    let baseARN;
    try {
      this.log.info(chalk`--: checking existing Lambda function {yellow ${functionName}}`);
      const { Configuration: { FunctionArn } } = await this._lambda.send(new GetFunctionCommand({
        FunctionName: functionName,
      }));
      baseARN = FunctionArn;
      this.log.info(chalk`{green ok}: exist {yellow ${FunctionArn}}`);
    } catch (e) {
      if (e.name === 'ResourceNotFoundException') {
        this.log.info(chalk`{green ok}: does not exist yet.`);
        this.log.info(chalk`--: creating new Lambda function {yellow ${functionName}}`);
        const res = await this._lambda.send(new CreateFunctionCommand(functionConfig));
        baseARN = res.FunctionArn;
      } else {
        this.log.error(chalk`Unable to verify existence of Lambda function {yellow ${functionName}}`);
        throw e;
      }
    }

    // update existing function
    if (baseARN) {
      await this.checkFunctionReady(baseARN);
      this.log.info(chalk`--: updating existing Lambda function configuration {yellow ${functionName}}`);
      await this._lambda.send(new UpdateFunctionConfigurationCommand(functionConfig));
      await this.checkFunctionReady(baseARN);
      this.log.info('--: updating Lambda function code...');
      await this._lambda.send(new UpdateFunctionCodeCommand({
        FunctionName: functionName,
        ...functionConfig.Code,
      }));
    }
    await this.checkFunctionReady(baseARN);

    this.log.info('--: publishing new version');
    const versiondata = await this._lambda.send(new PublishVersionCommand({
      FunctionName: functionName,
    }));

    this._functionARN = versiondata.FunctionArn;
    // eslint-disable-next-line prefer-destructuring
    this._accountId = this._functionARN.split(':')[4];
    const versionNum = versiondata.Version;
    this.log.info(chalk`{green ok}: version {yellow ${versionNum}} published.`);

    try {
      await this._lambda.send(new GetAliasCommand({
        FunctionName: functionName,
        Name: functionVersion,
      }));

      this.log.info(chalk`--: updating existing alias {yellow ${functionName}:${functionVersion}} to version {yellow ${versionNum}}`);
      const updatedata = await this._lambda.send(new UpdateAliasCommand({
        FunctionName: functionName,
        Name: functionVersion,
        FunctionVersion: versionNum,
      }));
      this._aliasARN = updatedata.AliasArn;
      this.log.info(chalk`{green ok}: alias {yellow ${this._aliasARN}} updated.`);
    } catch (e) {
      if (e.name === 'ResourceNotFoundException') {
        this.log.info(`--: creating new alias ${functionName}:${functionVersion} at v${versionNum}`);
        const createdata = await this._lambda.send(new CreateAliasCommand({
          FunctionName: functionName,
          Name: functionVersion,
          FunctionVersion: versionNum,
        }));
        this._aliasARN = createdata.AliasArn;
        this.log.info(chalk`{green ok}: alias {yellow ${this._aliasARN}} created.`);
      } else {
        this.log.error(`Unable to verify existence of Lambda alias ${functionName}:${functionVersion}`);
        throw e;
      }
    }
  }

  async initApiId() {
    let res;
    if (!this._cfg.apiId) {
      throw new Error('--aws-api is required');
    } else if (this._cfg.apiId === 'create') {
      this.log.info('--: creating API from scratch');
      res = await this._api.send(new CreateApiCommand({
        Name: API_GW_NAME_DEFAULT,
        ProtocolType: 'HTTP',
      }));
      this.log.info(`Using new API "${res.ApiId}"`);
    } else if (this._cfg.apiId === 'auto') {
      res = await this._api.send(new GetApisCommand({ }));
      // todo: find API with appropriate tag. eg `helix-deploy:<namespace`.
      res = res.Items.find((a) => a.Name === API_GW_NAME_DEFAULT);
      if (!res) {
        throw Error('--aws-api=auto didn\'t find an appropriate api.');
      }
      this.log.info(`--: using existing API "${res.ApiId}"`);
    } else {
      res = await this._api.send(new GetApiCommand({
        ApiId: this._cfg.apiId,
      }));
      this.log.info(`--: using existing API "${res.ApiId}"`);
    }
    const { ApiId, ApiEndpoint } = res;
    this._cfg.apiId = ApiId;
    this._apiEndpoint = ApiEndpoint;
    return { ApiId, ApiEndpoint };
  }

  async findIntegration(ApiId, IntegrationUri) {
    let nextToken;
    do {
      const res = await this._api.send(new GetIntegrationsCommand({
        ApiId,
        NextToken: nextToken,
      }));
      const integration = res.Items.find((i) => i.IntegrationUri === IntegrationUri);
      if (integration) {
        return integration;
      }
      nextToken = res.NextToken;
    } while (nextToken);
    return null;
  }

  async fetchIntegration(ApiId) {
    let nextToken;
    const integrations = [];
    do {
      const res = await this._api.send(new GetIntegrationsCommand({
        ApiId,
        NextToken: nextToken,
      }));
      integrations.push(...res.Items);
      nextToken = res.NextToken;
    } while (nextToken);
    return integrations;
  }

  async fetchRoutes(ApiId) {
    let nextToken;
    const routes = [];
    do {
      const res = await this._api.send(new GetRoutesCommand({
        ApiId,
        NextToken: nextToken,
      }));
      routes.push(...res.Items);
      nextToken = res.NextToken;
    } while (nextToken);
    return routes;
  }

  async fetchAuthorizers(ApiId) {
    let nextToken;
    const authorizers = [];
    do {
      const res = await this._api.send(new GetAuthorizersCommand({
        ApiId,
        NextToken: nextToken,
      }));
      authorizers.push(...res.Items);
      nextToken = res.NextToken;
    } while (nextToken);
    return authorizers;
  }

  async listAliases(functionName) {
    let nextMarker;
    const aliases = [];
    do {
      const res = await this._lambda.send(new ListAliasesCommand({
        FunctionName: functionName,
        Marker: nextMarker,
      }));
      aliases.push(...res.Aliases);
      nextMarker = res.NextMarker;
    } while (nextMarker);
    return aliases;
  }

  async listVersions(functionName) {
    let nextMarker;
    const versions = [];
    do {
      const res = await this._lambda.send(new ListVersionsByFunctionCommand({
        FunctionName: functionName,
        Marker: nextMarker,
      }));
      versions.push(...res.Versions);
      nextMarker = res.NextMarker;
    } while (nextMarker);
    return versions;
  }

  async createAPI() {
    const { cfg } = this;
    const { ApiId, ApiEndpoint } = await this.initApiId();
    this._functionURL = `${ApiEndpoint}${this.functionPath}`;

    // check for stage
    const res = await this._api.send(new GetStagesCommand({
      ApiId: this._cfg.apiId,
    }));
    const stage = res.Items.find((s) => s.StageName === '$default');
    if (!stage) {
      await this._api.send(new CreateStageCommand({
        StageName: '$default',
        AutoDeploy: true,
        ApiId,
      }));
    }

    if (this._cfg.createRoutes) {
      // find integration
      let integration = await this.findIntegration(ApiId, this._aliasARN);
      if (integration) {
        this.log.info(`--: using existing integration "${integration.IntegrationId}" for "${this._aliasARN}"`);
      } else {
        integration = await this._api.send(new CreateIntegrationCommand({
          ApiId,
          IntegrationMethod: 'POST',
          IntegrationType: 'AWS_PROXY',
          IntegrationUri: this._aliasARN,
          PayloadFormatVersion: '2.0',
          TimeoutInMillis: Math.min(cfg.timeout, 30000),
        }));
        this.log.info(chalk`{green ok:} created new integration "${integration.IntegrationId}" for "${this._aliasARN}"`);
      }
      // need to create 2 routes. one for the exact path, and one with suffix
      const { IntegrationId } = integration;
      this.log.info('--: fetching existing routes...');
      const routes = await this.fetchRoutes(ApiId);
      const routeParams = {
        ApiId,
        Target: `integrations/${IntegrationId}`,
      };
      await this.createOrUpdateRoute(routes, routeParams, `ANY ${this.functionPath}/{path+}`);
      await this.createOrUpdateRoute(routes, routeParams, `ANY ${this.functionPath}`);
    }

    // setup permissions for entire package.
    // this way we don't need to setup more permissions for link routes
    // eslint-disable-next-line no-underscore-dangle
    const sourceArn = `arn:aws:execute-api:${this._cfg.region}:${this._accountId}:${ApiId}/*/*/${cfg.packageName}/*`;
    try {
      // eslint-disable-next-line no-await-in-loop
      await this._lambda.send(new AddPermissionCommand({
        FunctionName: this._aliasARN,
        Action: 'lambda:InvokeFunction',
        SourceArn: sourceArn,
        Principal: 'apigateway.amazonaws.com',
        StatementId: crypto.createHash('md5').update(this._aliasARN + sourceArn).digest('hex'),
      }));
      this.log.info(chalk`{green ok:} added invoke permissions for ${sourceArn}`);
    } catch (e) {
      // ignore, most likely the permission already exists
    }

    this.log.info(chalk`{green ok:} function deployed: {blueBright ${this._functionURL}}`);
  }

  async test() {
    let url = this._functionURL;
    if (!url) {
      url = `https://${this._cfg.apiId}.execute-api.${this._cfg.region}.amazonaws.com${this.functionPath}`;
    }
    return this.testRequest({
      url,
      idHeader: 'apigw-requestid',
      retry404: 5,
    });
  }

  get fullFunctionName() {
    return this._functionURL;
  }

  async updateSecrets() {
    const { cfg } = this;
    const SecretId = cfg.updateSecrets || `/helix-deploy/${cfg.packageName}/${cfg.baseName}`;
    this.log.info(`--: updating app parameters in secrets manager at '${SecretId}'...`);
    try {
      await this._sm.send(new PutSecretValueCommand({
        SecretId,
        SecretString: JSON.stringify(cfg.params),
      }));
    } catch (e) {
      this.log.error(chalk`{red error:} unable to update value of '${SecretId}'`);
      throw e;
    }
  }

  async updatePackage() {
    const { cfg } = this;
    let found = false;
    if (this._cfg.parameterMgr.includes('secret')) {
      found = true;
      this.log.info('--: updating app (package) parameters (secrets mananger)...');
      const SecretId = `/helix-deploy/${cfg.packageName}/all`;
      try {
        await this._sm.send(new PutSecretValueCommand({
          SecretId,
          SecretString: JSON.stringify(cfg.packageParams),
        }));
      } catch (e) {
        this.log.error(chalk`{red error:} unable to update value of '${SecretId}'`);
        throw e;
      }
    }

    if (this._cfg.parameterMgr.includes('system')) {
      found = true;
      this.log.info('--: updating app (package) parameters (param store)...');
      const commands = Object
        .entries(cfg.packageParams)
        .map(([key, value]) => this._ssm.send(new PutParameterCommand({
          Name: `/helix-deploy/${cfg.packageName}/${key}`,
          Value: value,
          Type: 'SecureString',
          DataType: 'text',
          Overwrite: true,
        })));
      await Promise.all(commands);
    }

    if (!found) {
      throw Error(`Unable to update package parameters. invalid manager specified: ${this._cfg.parameterMgr}`);
    }

    this.log.info(chalk`{green ok}: parameters updated.`);
  }

  async cleanup() {
    const { cfg, functionName } = this;
    const cleanupMatchers = [{
      name: 'CI',
      property: 'cleanupCiAge',
      match: (alias) => alias.match(/^ci(\d+)$/),
    }, {
      name: 'patch',
      property: 'cleanupPatchAge',
      match: (alias) => alias.match(/^(\d+)_(\d+)_(\d+)(-test)?$/),
    }];

    try {
      this.log.info('Clean up old aliases and versions');
      this.log.info(chalk`--: fetching aliases...`);
      const aliases = await this.listAliases(functionName);
      this.log.info(chalk`--: fetching versions...`);
      const versions = (await this.listVersions(functionName))
        .map((version) => ({
          ...version,
          Aliases: aliases
            .filter(({ FunctionVersion }) => version.Version === FunctionVersion)
            .map(({ Name }) => Name),
        }));

      for (const { name, property, match } of cleanupMatchers) {
        if (cfg[property]) {
          const cleanupBefore = Date.now() - (cfg[property] * 1000);
          const oldVersions = versions
            .filter(({ Aliases }) => Aliases.length > 0 && Aliases.every((alias) => match(alias)))
            .filter(({ LastModified }) => Date.parse(LastModified) < cleanupBefore);
          this.log.info(`Found ${oldVersions.length} old ${name} versions`);

          if (oldVersions.length) {
            this.log.info(chalk`--: deleting their aliases and versions...`);
            const deleted = await processQueue(oldVersions, async ({ Aliases, Version }) => {
              await Promise.all(Aliases.map(async (Name) => {
                await this._lambda.send(new DeleteAliasCommand({
                  FunctionName: functionName,
                  Name,
                }));
              }));
              await this._lambda.send(new DeleteFunctionCommand({
                FunctionName: functionName,
                Qualifier: Version,
              }));
              return Version;
            }, 2);
            this.log.info(chalk`{green ok}: deleted ${deleted.length} old ${name} versions.`);
          }
        }
      }
    } catch (e) {
      this.log.error(chalk`{red error:} Cleanup failed, proceeding anyway.`, e);
    }
  }

  async cleanUpIntegrations(filter) {
    this.log.info('Clean up Integrations');
    const { ApiId } = await this.initApiId();
    this.log.info(chalk`--: fetching routes...`);
    const routes = await this.fetchRoutes(ApiId);
    this.log.info(chalk`{green ok}: ${routes.length} routes.`);

    this.log.info(chalk`--: fetching integrations...`);
    const ints = await this.fetchIntegration(ApiId);
    this.log.info(chalk`{green ok}: ${ints.length} integrations.`);
    const routesByTarget = new Map();
    routes.forEach((route) => {
      const rts = routesByTarget.get(route.Target) || [];
      routesByTarget.set(route.Target, rts);
      rts.push(route);
    });
    const unused = [];
    if (filter) {
      this.log.info(chalk`Integrations / Routes for {grey ${filter}}`);
    } else {
      this.log.info('Integrations / Routes');
    }
    ints.sort((i0, i1) => (i0.IntegrationUri.localeCompare(i1.IntegrationUri)));
    ints.forEach((int, idx) => {
      if (filter && int.IntegrationUri.indexOf(filter) < 0) {
        return;
      }
      const key = `integrations/${int.IntegrationId}`;
      let pfx = idx === ints.length - 1 ? '└──' : '├──';
      const fnc = int.IntegrationUri.split(':').splice(-2, 2).join('@');
      this.log.info(chalk`${pfx} {yellow ${fnc}} {grey (${int.IntegrationId}})`);
      const rts = routesByTarget.get(key) || [];
      if (!rts.length) {
        unused.push(int);
      }
      pfx = idx === ints.length - 1 ? '    ' : '│   ';
      rts.forEach((route, idx1) => {
        const pfx1 = idx1 === rts.length - 1 ? '└──' : '├──';
        this.log.info(chalk`${pfx}${pfx1} {blue ${route.RouteKey}}`);
      });
    });
    if (!unused.length) {
      this.log.info(chalk`{green ok}: No unused integrations.`);
      return;
    }
    this.log.info(chalk`--: deleting ${unused.length} unused integrations...`);
    // don't execute parallel to avoid flooding the API
    for (const int of unused) {
      const fnc = int.IntegrationUri.split(':')
        .splice(-2, 2)
        .join('@');
      try {
        await this._api.send(new DeleteIntegrationCommand({
          ApiId,
          IntegrationId: int.IntegrationId,
        }));
        this.log.info(chalk`{green ok}: {yellow ${int.IntegrationId}} {grey ${fnc}}`);
        // const delay = res.$metadata.totalRetryDelay;
      } catch (e) {
        this.log.info(chalk`{red error}: {yellow ${int.IntegrationId}} {grey ${fnc}}: ${e.message}`);
      }
    }
    this.log.info(chalk`{green ok}: deleted ${unused.length} unused integrations.`);
  }

  async createOrUpdateRoute(routes, routeParams, RouteKey) {
    const existing = routes.find((r) => r.RouteKey === RouteKey);
    const auth = routeParams.AuthorizerId ? chalk` {yellow (${routeParams.AuthorizerId})}` : '';
    if (existing) {
      this.log.info(chalk`--: updating route for: {blue ${existing.RouteKey}}...`);
      const res = await this._api.send(new UpdateRouteCommand({
        ...routeParams,
        RouteKey,
        RouteId: existing.RouteId,
      }));
      this.log.info(chalk`{green ok}: updated route for: {blue ${res.RouteKey}}${auth}`);
    } else {
      this.log.info(chalk`--: creating route for: {blue ${RouteKey}}...`);
      const res = await this._api.send(new CreateRouteCommand({
        ...routeParams,
        RouteKey,
      }));
      this.log.info(chalk`{green ok}: created route for: {blue ${res.RouteKey}}${auth}`);
    }
  }

  async createOrUpdateAlias(name, functionName, functionVersion) {
    try {
      await this._lambda.send(new GetAliasCommand({
        FunctionName: functionName,
        Name: name,
      }));
      this.log.info(chalk`--: updating alias {blue ${name}}...`);
      const res = await this._lambda.send(new UpdateAliasCommand({
        FunctionName: functionName,
        Name: name,
        FunctionVersion: functionVersion,
      }));
      this.log.info(chalk`{green ok:} updated alias {blue ${name}} to version {yellow ${functionVersion}}.`);
      return res.AliasArn;
    } catch (e) {
      if (e.name === 'ResourceNotFoundException') {
        this.log.info(chalk`--: creating alias {blue ${name}}...`);
        const res = await this._lambda.send(new CreateAliasCommand({
          FunctionName: functionName,
          Name: name,
          FunctionVersion: functionVersion,
        }));
        this.log.info(chalk`{green ok:} created alias {blue ${name}} for version {yellow ${functionVersion}}.`);
        return res.AliasArn;
      } else {
        this.log.error(`Unable to verify existence of Lambda alias ${name}`);
        throw e;
      }
    }
  }

  async updateLinks() {
    const { cfg, functionName } = this;
    const { ApiId } = await this.initApiId();
    const functionVersion = cfg.version.replace(/\./g, '_');

    let res;
    let incrementalVersion;
    try {
      this.log.info(chalk`--: fetching alias ...`);
      res = await this._lambda.send(new GetAliasCommand({
        FunctionName: functionName,
        Name: functionVersion,
      }));
      incrementalVersion = res.FunctionVersion;
      // eslint-disable-next-line prefer-destructuring
      this._accountId = res.AliasArn.split(':')[4];
      this.log.info(chalk`{green ok}: ${functionName}@${functionVersion} => ${incrementalVersion}`);
    } catch (e) {
      this.log.error(chalk`{red error}: Unable to create link to function ${functionName}`);
      throw e;
    }

    // get all the routes
    this.log.info(chalk`--: fetching routes ...`);
    const routes = await this.fetchRoutes(ApiId);

    // create routes for each symlink
    const sfx = this.getLinkVersions();

    for (const suffix of sfx) {
      // create or update alias
      const aliasArn = await this.createOrUpdateAlias(suffix.replace('.', '_'), functionName, incrementalVersion);

      // find or create integration
      let integration = await this.findIntegration(ApiId, aliasArn);
      if (integration) {
        this.log.info(`--: using existing integration "${integration.IntegrationId}" for "${aliasArn}"`);
      } else {
        integration = await this._api.send(new CreateIntegrationCommand({
          ApiId,
          IntegrationMethod: 'POST',
          IntegrationType: 'AWS_PROXY',
          IntegrationUri: aliasArn,
          PayloadFormatVersion: '2.0',
          TimeoutInMillis: Math.min(cfg.timeout, 30000),
        }));
        this.log.info(chalk`{green ok:} created new integration "${integration.IntegrationId}" for "${aliasArn}"`);
      }
      const { IntegrationId } = integration;

      const routeParams = {
        ApiId,
        Target: `integrations/${IntegrationId}`,
        AuthorizerId: undefined,
        AuthorizationType: 'NONE',
      };
      if (this._cfg.attachAuthorizer) {
        this.log.info(chalk`--: fetching authorizers...`);
        const authorizers = await this.fetchAuthorizers(ApiId);
        const authorizer = authorizers.find((info) => info.Name === this._cfg.attachAuthorizer);
        if (!authorizer) {
          throw Error(`Specified authorizer ${this._cfg.attachAuthorizer} does not exist in api ${ApiId}.`);
        }
        routeParams.AuthorizerId = authorizer.AuthorizerId;
        routeParams.AuthorizationType = 'CUSTOM';
        this.log.info(chalk`{green ok:} configuring routes with authorizer {blue ${this._cfg.attachAuthorizer}} {yellow ${authorizer.AuthorizerId}}`);
      }

      // create or update routes
      await this.createOrUpdateRoute(routes, routeParams, `ANY /${cfg.packageName}/${cfg.baseName}/${suffix}`);
      await this.createOrUpdateRoute(routes, routeParams, `ANY /${cfg.packageName}/${cfg.baseName}/${suffix}/{path+}`);

      await this.updateAuthorizers(ApiId, functionName, aliasArn);

      // add permissions to invoke function (with and without path)
      let sourceArn = `arn:aws:execute-api:${this._cfg.region}:${this._accountId}:${ApiId}/*/*/${cfg.packageName}/${cfg.baseName}/${suffix}`;
      try {
        // eslint-disable-next-line no-await-in-loop
        await this._lambda.send(new AddPermissionCommand({
          FunctionName: aliasArn,
          Action: 'lambda:InvokeFunction',
          SourceArn: sourceArn,
          Principal: 'apigateway.amazonaws.com',
          StatementId: crypto.createHash('md5').update(aliasArn + sourceArn).digest('hex'),
        }));
        this.log.info(chalk`{green ok:} added invoke permissions for ${sourceArn}`);
      } catch (e) {
        // ignore, most likely the permission already exists
      }
      sourceArn = `arn:aws:execute-api:${this._cfg.region}:${this._accountId}:${ApiId}/*/*/${cfg.packageName}/${cfg.baseName}/${suffix}/{path+}`;
      try {
        // eslint-disable-next-line no-await-in-loop
        await this._lambda.send(new AddPermissionCommand({
          FunctionName: aliasArn,
          Action: 'lambda:InvokeFunction',
          SourceArn: sourceArn,
          Principal: 'apigateway.amazonaws.com',
          StatementId: crypto.createHash('md5').update(aliasArn + sourceArn).digest('hex'),
        }));
        this.log.info(chalk`{green ok:} added invoke permissions for ${sourceArn}`);
      } catch (e) {
        // ignore, most likely the permission already exists
      }
    }
  }

  async updateAuthorizers(ApiId, functionName, aliasArn) {
    const cfg = this._cfg;
    if (!cfg.createAuthorizer) {
      return;
    }

    const AUTH_URI_PREFIX = `arn:aws:apigateway:${cfg.region}:lambda:path/2015-03-31/functions/`;
    const accountId = aliasArn.split(':')[4];
    this.log.info(chalk`--: patching authorizers...`);
    const authorizers = await this.fetchAuthorizers(ApiId);
    const versions = this.getLinkVersions();
    for (const version of versions) {
      const props = {
        ...this.cfg,
        ...this.cfg.properties,
        // overwrite version with link name
        version,
      };
      const authorizerName = ActionBuilder.substitute(cfg.createAuthorizer, props).replace(/\./g, '_');
      const existing = authorizers.find((info) => info.Name === authorizerName) || {};
      let { AuthorizerId } = existing;
      if (AuthorizerId) {
        const res = await this._api.send(new UpdateAuthorizerCommand({
          ApiId,
          AuthorizerId,
          AuthorizerUri: `${AUTH_URI_PREFIX}${aliasArn}/invocations`,
          IdentitySource: this._cfg.identitySources,
        }));
        this.log.info(chalk`{green ok}: updated authorizer: {blue ${res.Name}}`);
      } else {
        const res = await this._api.send(new CreateAuthorizerCommand({
          ApiId,
          AuthorizerPayloadFormatVersion: '2.0',
          AuthorizerType: 'REQUEST',
          AuthorizerUri: `${AUTH_URI_PREFIX}${aliasArn}/invocations`,
          AuthorizerResultTtlInSeconds: 0,
          EnableSimpleResponses: true,
          IdentitySource: this._cfg.identitySources,
          Name: authorizerName,
        }));
        AuthorizerId = res.AuthorizerId;
        this.log.info(chalk`{green ok}: created authorizer: {blue ${res.Name}}`);
      }

      // add permission to alias for the API Gateway is allowed to invoke the authorized function
      try {
        const sourceArn = `arn:aws:execute-api:${this._cfg.region}:${accountId}:${ApiId}/authorizers/${AuthorizerId}`;
        await this._lambda.send(new AddPermissionCommand({
          FunctionName: aliasArn,
          Action: 'lambda:InvokeFunction',
          SourceArn: sourceArn,
          Principal: 'apigateway.amazonaws.com',
          StatementId: crypto.createHash('sha256').update(aliasArn + sourceArn).digest('hex'),
        }));
        this.log.info(chalk`{green ok:} added invoke permissions for ${sourceArn}`);
      } catch (e) {
        // ignore, most likely the permission already exists
      }
    }
  }

  async checkFunctionReady(arn) {
    let tries = 3;
    while (tries > 0) {
      try {
        tries -= 1;
        this.log.info(chalk`--: checking function state ...`);
        const { Configuration } = await this._lambda.send(new GetFunctionCommand({
          FunctionName: arn ?? this._functionARN,
        }));
        if (Configuration.State !== 'Active' || Configuration.LastUpdateStatus === 'InProgress') {
          this.log.info(chalk`{yellow !!:} function is {blue ${Configuration.State}} and last update was {blue ${Configuration.LastUpdateStatus}} (retry...)`);
        } else {
          this.log.info(chalk`{green ok:} function is {blue ${Configuration.State}} and last update was {blue ${Configuration.LastUpdateStatus}}.`);
          return;
        }
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => {
          setTimeout(resolve, 1500);
        });
      } catch (e) {
        this.log.error(chalk`{red error}: error checking function state`);
        throw e;
      }
    }
    this.log.warn(chalk`{yellow warn:} function is not active yet, which might lead to failed requests.`);
  }

  async validateAdditionalTasks() {
    if (this._cfg.cleanUpIntegrations || this._cfg.updateSecrets !== undefined) {
      // disable auto build if no deploy
      if (!this.cfg.deploy) {
        this.cfg.build = false;
      }
      await this.validate();
    }
  }

  async runAdditionalTasks() {
    if (this._cfg.cleanUpIntegrations) {
      await this.cleanUpIntegrations();
    }
    if (this._cfg.updateSecrets !== undefined) {
      await this.updateSecrets();
    }
  }

  async createExtraPermissions() {
    const { functionName } = this;

    if (this._cfg.extraPermissions) {
      await Promise.allSettled(this._cfg.extraPermissions.map(async (extraPermission) => {
        const [sourceArn, principal] = extraPermission.split('@', 2);
        try {
          await this._lambda.send(new AddPermissionCommand({
            FunctionName: functionName,
            Action: 'lambda:InvokeFunction',
            SourceArn: sourceArn,
            Principal: principal,
            StatementId: crypto.createHash('sha256').update(functionName + sourceArn).digest('hex'),
          }));
          this.log.info(chalk`{green ok:} added invoke permissions for ${sourceArn}`);
        } catch (e) {
          // ignore, most likely the permission already exists
        }
      }));
    }
  }

  async deploy() {
    try {
      this.log.info(`--: using aws region "${this._cfg.region}"`);
      await this.initAccountId();
      await this.uploadZIP();
      await this.createLambda();
      await this.deleteZIP();
      await this.createAPI();
      await this.createExtraPermissions();
      await this.checkFunctionReady();
    } catch (err) {
      this.log.error(`Unable to deploy Lambda function: ${err.message}`, err);
      throw err;
    }
  }

  async close() {
    this._s3?.destroy();
    this._lambda?.destroy();
    this._api?.destroy();
    this._ssm?.destroy();
    this._sm?.destroy();

    await super.close();
  }
}

AWSDeployer.Config = AWSConfig;
