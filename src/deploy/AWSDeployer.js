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
const chalk = require('chalk');
const {
  S3Client,
  CreateBucketCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} = require('@aws-sdk/client-s3');
const {
  LambdaClient,
  CreateFunctionCommand,
  GetFunctionCommand,
  UpdateFunctionConfigurationCommand,
  UpdateFunctionCodeCommand,
  GetAliasCommand,
  PublishVersionCommand,
  CreateAliasCommand,
  UpdateAliasCommand,
  AddPermissionCommand,
} = require('@aws-sdk/client-lambda');
const {
  ApiGatewayV2Client,
  GetApisCommand,
  GetApiCommand,
  GetStagesCommand,
  GetIntegrationsCommand,
  CreateApiCommand,
  CreateStageCommand,
  CreateIntegrationCommand,
  DeleteIntegrationCommand,
  CreateRouteCommand,
  GetRoutesCommand,
  UpdateRouteCommand,
} = require('@aws-sdk/client-apigatewayv2');
const {
  SSMClient,
  PutParameterCommand,
} = require('@aws-sdk/client-ssm');
const path = require('path');
const fse = require('fs-extra');
const crypto = require('crypto');
const BaseDeployer = require('./BaseDeployer');
const ActionBuilder = require('../ActionBuilder.js');
const AWSConfig = require('./AWSConfig.js');

class AWSDeployer extends BaseDeployer {
  constructor(baseConfig, config) {
    super(baseConfig);

    Object.assign(this, {
      id: 'aws',
      name: 'AmazonWebServices',
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

  validate() {
    if (!this._cfg.role || !this._cfg.region) {
      throw Error('AWS target needs --aws-region and --aws-role');
    }
  }

  async init() {
    this._bucket = `poly-func-maker-temp-${crypto.randomBytes(16).toString('hex')}`;
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
    }
  }

  async createS3Bucket() {
    const data = await this._s3.send(new CreateBucketCommand({
      Bucket: this._bucket,
    }));
    this.log.info(chalk`{green ok:} bucket ${data.Location} created`);
  }

  async uploadZIP() {
    const { cfg } = this;
    const relZip = path.relative(process.cwd(), cfg.zipFile);

    this.log.info(`--: uploading ${relZip} to S3 bucket ${this._bucket} ...`);
    const uploadParams = {
      Bucket: this._bucket,
      Key: relZip,
      Body: await fse.readFile(cfg.zipFile),
    };

    await this._s3.send(new PutObjectCommand(uploadParams));

    this._key = relZip;
    this.log.info(chalk`{green ok:} file uploaded`);
  }

  async deleteS3Bucket() {
    await this._s3.send(new DeleteObjectCommand({
      Bucket: this._bucket,
      Key: this._key,
    }));
    await this._s3.send(new DeleteBucketCommand({
      Bucket: this._bucket,
    }));
    this.log.info(chalk`{green ok:} bucket ${this._bucket} emptied and deleted`);
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
      Handler: 'index.lambda',
    };

    try {
      this.log.info(`--: updating existing Lambda function ${functionName}`);
      await this._lambda.send(new GetFunctionCommand({
        FunctionName: functionName,
      }));
      await this._lambda.send(new UpdateFunctionConfigurationCommand(functionConfig));
      await this._lambda.send(new UpdateFunctionCodeCommand({
        FunctionName: functionName,
        ...functionConfig.Code,
      }));
    } catch (e) {
      if (e.name === 'ResourceNotFoundException') {
        this.log.info(`--: creating new Lambda function ${functionName}`);
        await this._lambda.send(new CreateFunctionCommand(functionConfig));
      } else {
        this.log.error(`Unable to verify existence of Lambda function ${functionName}`);
        throw e;
      }
    }

    const versiondata = await this._lambda.send(new PublishVersionCommand({
      FunctionName: functionName,
    }));

    this._functionARN = versiondata.FunctionArn;
    // eslint-disable-next-line prefer-destructuring
    this._accountId = this._functionARN.split(':')[4];

    const versionNum = versiondata.Version;
    try {
      await this._lambda.send(new GetAliasCommand({
        FunctionName: functionName,
        Name: functionVersion,
      }));

      this.log.info(`--: updating existing alias ${functionName}:${functionVersion} to v${versionNum}`);
      const updatedata = await this._lambda.send(new UpdateAliasCommand({
        FunctionName: functionName,
        Name: functionVersion,
        FunctionVersion: versionNum,
      }));

      this._aliasARN = updatedata.AliasArn;
    } catch (e) {
      if (e.name === 'ResourceNotFoundException') {
        this.log.info(`--: creating new alias ${functionName}:${functionVersion} at v${versionNum}`);
        const createdata = await this._lambda.send(new CreateAliasCommand({
          FunctionName: functionName,
          Name: functionVersion,
          FunctionVersion: versionNum,
        }));
        this._aliasARN = createdata.AliasArn;
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
        Name: 'API managed by Poly-Func',
        ProtocolType: 'HTTP',
      }));
      this.log.info(`Using new API "${res.ApiId}"`);
    } else if (this._cfg.apiId === 'auto') {
      res = await this._api.send(new GetApisCommand({ }));
      // todo: find API with appropriate tag. eg `helix-deploy:<namespace`.
      res = res.Items.find((a) => a.Name === 'API managed by Poly-Func');
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
      await this.createOrUpdateRoute(routes, ApiId, IntegrationId, `ANY ${this.functionPath}/{path+}`);
      await this.createOrUpdateRoute(routes, ApiId, IntegrationId, `ANY ${this.functionPath}`);
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

    if (cfg.showHints) {
      const opts = '';
      this.log.info('\nYou can verify the action with:');
      this.log.info(chalk`{grey $ curl${opts} "${this._functionURL}"}`);
    }
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

  async updatePackage() {
    const { cfg } = this;
    this.log.info('--: updating app (package) parameters ...');
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

    this.log.info('parameters updated');
  }

  async cleanUpBuckets() {
    this.log.info('--: cleaning up stray temporary S3 buckets ...');
    let res = await this._s3.send(new ListBucketsCommand({}));
    const helixBuckets = res.Buckets.filter((b) => b.Name.startsWith('poly-func-maker-temp-'));
    if (helixBuckets.length === 0) {
      this.log.info(chalk`{green ok}: no stray buckets found.`);
    } else {
      await Promise.all(helixBuckets.map(async (b) => {
        // get all objects
        res = await this._s3.send(new ListObjectsV2Command({
          Bucket: b.Name,
        }));
        const keys = (res.Contents || []).map((c) => ({
          Key: c.Key,
        }));
        if (keys.length) {
          await this._s3.send(new DeleteObjectsCommand({
            Bucket: b.Name,
            Delete: {
              Objects: keys,
            },
          }));
        }
        await this._s3.send(new DeleteBucketCommand({
          Bucket: b.Name,
        }));
        this.log.info(chalk`{green ok}: deleted temporary bucket: ${b.Name}.`);
      }));
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
      this.log.info(chalk`Integrations / Routes for {gray ${filter}}`);
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

  async createOrUpdateRoute(routes, ApiId, IntegrationId, RouteKey) {
    const existing = routes.find((r) => r.RouteKey === RouteKey);
    if (existing) {
      this.log.info(chalk`--: updating route for: {blue ${existing.RouteKey}}...`);
      const res = await this._api.send(new UpdateRouteCommand({
        ApiId,
        RouteId: existing.RouteId,
        RouteKey,
        Target: `integrations/${IntegrationId}`,
      }));
      this.log.info(chalk`{green ok}: updated route for: {blue ${res.RouteKey}}`);
    } else {
      this.log.info(chalk`--: creating route for: {blue ${RouteKey}}...`);
      const res = await this._api.send(new CreateRouteCommand({
        ApiId,
        RouteKey,
        Target: `integrations/${IntegrationId}`,
      }));
      this.log.info(chalk`{green ok}: created route for: {blue ${res.RouteKey}}`);
    }
  }

  async updateLinks() {
    const { cfg, functionName } = this;
    const { ApiId } = await this.initApiId();
    const functionVersion = cfg.version.replace(/\./g, '_');

    // get function alias
    let res;
    let aliasArn;
    try {
      this.log.info(chalk`--: fetching alias ...`);
      res = await this._lambda.send(new GetAliasCommand({
        FunctionName: functionName,
        Name: functionVersion,
      }));
      aliasArn = res.AliasArn;
      this.log.info(chalk`{green ok}: ${aliasArn}`);
    } catch (e) {
      this.log.error(chalk`{red error}: Unable to create link to function ${functionName}`);
      throw e;
    }

    // find integration
    let integration = await this.findIntegration(ApiId, aliasArn);
    let cleanup = false;
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
      cleanup = true;
    }
    const { IntegrationId } = integration;

    // get all the routes
    this.log.info(chalk`--: patching routes ...`);
    const routes = await this.fetchRoutes(ApiId);

    // create routes for each symlink
    const sfx = this.getLinkVersions();

    for (const suffix of sfx) {
      // check if route already exists
      await this.createOrUpdateRoute(routes, ApiId, IntegrationId, `ANY /${cfg.packageName}/${cfg.baseName}/${suffix}`);
      await this.createOrUpdateRoute(routes, ApiId, IntegrationId, `ANY /${cfg.packageName}/${cfg.baseName}/${suffix}/{path+}`);
    }
    if (cleanup) {
      this.cleanUpIntegrations(functionName);
    }
  }

  async runAdditionalTasks() {
    if (this._cfg.cleanUpBuckets) {
      await this.cleanUpBuckets();
    }
    if (this._cfg.cleanUpIntegrations) {
      await this.cleanUpIntegrations();
    }
  }

  async deploy() {
    try {
      await this.createS3Bucket();
      await this.uploadZIP();
      await this.createLambda();
      await this.createAPI();
      await this.deleteS3Bucket();
    } catch (err) {
      this.log.error(`Unable to deploy Lambda function: ${err.message}`, err);
      throw err;
    }
  }
}

AWSDeployer.Config = AWSConfig;
module.exports = AWSDeployer;
