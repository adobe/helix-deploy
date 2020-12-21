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
const chalk = require('chalk');
const {
  S3Client,
  CreateBucketCommand,
  PutObjectCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
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
  CreateRouteCommand,
} = require('@aws-sdk/client-apigatewayv2');
const {
  SSMClient,
  PutParameterCommand,
} = require('@aws-sdk/client-ssm');
const path = require('path');
const fse = require('fs-extra');
const crypto = require('crypto');
const BaseDeployer = require('./BaseDeployer');

class AWSDeployer extends BaseDeployer {
  constructor(builder) {
    super(builder);

    Object.assign(this, {
      name: 'AmazonWebServices',
      _region: '',
      _role: '',
      _functionARN: '',
    });
  }

  withAWSRegion(value) {
    this._region = value;
    return this;
  }

  withAWSRole(value) {
    this._role = value;
    return this;
  }

  withAWSApi(value) {
    this._apiId = value;
    return this;
  }

  ready() {
    const res = !!this._region
    && !!this._s3
    && !!this._role
    && !!this._lambda
    && !!this._ssm
    && !!this._apiId;
    return res;
  }

  get host() {
    return `${this._apiId}.execute-api.${this._region}.amazonaws.com`;
  }

  get urlVCL() {
    return `"/${this._builder.packageName}" + regsub(req.url, "@", "_")`;
  }

  validate() {
    if (!this._role || !this._region) {
      throw Error('AWS target needs --aws-region and --aws-role');
    }
  }

  async init() {
    this._bucket = `poly-func-maker-temp-${crypto.randomBytes(16).toString('hex')}`;
    if (this._region) {
      this._s3 = new S3Client({
        region: this._region,
      });
      this._lambda = new LambdaClient({
        region: this._region,
      });
      this._api = new ApiGatewayV2Client({
        region: this._region,
      });
      this._ssm = new SSMClient({
        region: this._region,
      });
    }
  }

  async createS3Bucket() {
    const data = await this._s3.send(new CreateBucketCommand({
      Bucket: this._bucket,
    }));
    this.log.info(`Bucket ${data.Location} created`);
  }

  async uploadZIP() {
    const relZip = path.relative(process.cwd(), this._builder.zipFile);

    this.log.info(`--: uploading ${relZip} to S3 bucket ${this._bucket} ...`);
    const uploadParams = {
      Bucket: this._bucket,
      Key: relZip,
      Body: await fse.readFile(this._builder.zipFile),
    };

    await this._s3.send(new PutObjectCommand(uploadParams));

    this._key = relZip;
    this.log.info('File uploaded ');
  }

  async deleteS3Bucket() {
    await this._s3.send(new DeleteObjectCommand({
      Bucket: this._bucket,
      Key: this._key,
    }));
    await this._s3.send(new DeleteBucketCommand({
      Bucket: this._bucket,
    }));
    this.log.info(`Bucket ${this._bucket} emptied and deleted`);
  }

  async createLambda() {
    const functionName = `${this._builder.packageName}--${this._builder.name.replace(/@.*/g, '')}`;
    const functionVersion = this._builder.name.replace(/.*@/g, '').replace(/\./g, '_');

    const functionConfig = {
      Code: {
        S3Bucket: this._bucket,
        S3Key: this._key,
      },
      // todo: package name
      FunctionName: functionName,
      Role: this._role,
      Runtime: `nodejs${this._builder.nodeVersion}.x`,
      // todo: cram annotations into description?
      Tags: {
        pkgVersion: this._builder.version,
        // AWS tags have a size limit of 256. currently disabling
        // dependencies: this._builder.dependencies.main
        //   .map((dep) => `${dep.name}:${dep.version}`).join(','),
        repository: encodeURIComponent(this._builder.gitUrl).replace(/%/g, '@'),
        git: encodeURIComponent(`${this._builder.gitOrigin}#${this._builder.gitRef}`).replace(/%/g, '@'),
        updated: `${this._builder.updatedAt}`,
      },
      Description: this._builder.pkgJson.description,
      MemorySize: this._builder.memory,
      Timeout: Math.floor(this._builder.timeout / 1000),
      Environment: {
        Variables: this._builder.params,
      },
      Handler: 'index.lambda',
    };

    try {
      this.log.info(`Updating existing Lambda function ${functionName}`);
      await this._lambda.send(new GetFunctionCommand({
        FunctionName: functionName,
      }));

      const updatecode = this._lambda.send(new UpdateFunctionCodeCommand({
        FunctionName: functionName,
        ...functionConfig.Code,
      }));
      const updateconfig = this._lambda.send(
        new UpdateFunctionConfigurationCommand(functionConfig),
      );

      await updateconfig;
      await updatecode;
    } catch (e) {
      if (e.name === 'ResourceNotFoundException') {
        this.log.info(`Creating new Lambda function ${functionName}`);
        await this._lambda.send(new CreateFunctionCommand(functionConfig));
      } else {
        this.log.error(`Unable to verify existence of Lambda function ${functionName}`);
        throw e;
      }
    }

    const versiondata = await this._lambda.send(new PublishVersionCommand({
      FunctionName: functionName,
    }));

    this._functionARN = versiondata.functionArn;

    const versionNum = versiondata.Version;
    try {
      await this._lambda.send(new GetAliasCommand({
        FunctionName: functionName,
        Name: functionVersion,
      }));

      this.log.info(`Updating existing alias ${functionName}:${functionVersion} to v${versionNum}`);
      const updatedata = await this._lambda.send(new UpdateAliasCommand({
        FunctionName: functionName,
        Name: functionVersion,
        FunctionVersion: versionNum,
      }));

      this._functionARN = updatedata.AliasArn;
    } catch (e) {
      if (e.name === 'ResourceNotFoundException') {
        this.log.info(`Creating new alias ${functionName}:${functionVersion} at v${versionNum}`);
        const createdata = await this._lambda.send(new CreateAliasCommand({
          FunctionName: functionName,
          Name: functionVersion,
          FunctionVersion: versionNum,
        }));
        this._functionARN = createdata.AliasArn;
      } else {
        this.log.error(`Unable to verify existence of Lambda alias ${functionName}:${functionVersion}`);
        throw e;
      }
    }
  }

  async createAPI() {
    let res;
    if (!this._apiId) {
      throw new Error('--aws-api is required');
    } else if (this._apiId === 'create') {
      this.log.info('Creating API from scratch');
      res = await this._api.send(new CreateApiCommand({
        Name: 'API managed by Poly-Func',
        ProtocolType: 'HTTP',
      }));
      this.log.info(`Using new API "${res.ApiId}"`);
    } else if (this._apiId === 'auto') {
      res = await this._api.send(new GetApisCommand({ }));
      // todo: find API with appropriate tag. eg `helix-deploy:<namespace`.
      res = res.Items.find((a) => a.Name === 'API managed by Poly-Func');
      if (!res) {
        throw Error('--aws-api=auto didn\'t find an appropriate api.');
      }
      this.log.info(`Using existing API "${res.ApiId}"`);
    } else {
      res = await this._api.send(new GetApiCommand({
        ApiId: this._apiId,
      }));
      this.log.info(`Using existing API "${res.ApiId}"`);
    }

    const { ApiId, ApiEndpoint } = res;
    const functionQName = this._builder.actionName.replace('@', '_');
    this._apiId = ApiId;
    this._functionURL = `${ApiEndpoint}/${functionQName}`;

    // check for stage
    res = await this._api.send(new GetStagesCommand({
      ApiId: this._apiId,
    }));
    const stage = res.Items.find((s) => s.StageName === '$default');
    if (!stage) {
      res = await this._api.send(new CreateStageCommand({
        StageName: '$default',
        AutoDeploy: true,
        ApiId,
      }));
    }

    // find integration
    res = await this._api.send(new GetIntegrationsCommand({
      ApiId,
    }));
    let integration = res.Items.find((i) => i.IntegrationUri === this._functionARN);
    if (integration) {
      this.log.info(`Using existing integration "${integration.IntegrationId}" for "${this._functionARN}"`);
    } else {
      integration = await this._api.send(new CreateIntegrationCommand({
        ApiId,
        IntegrationMethod: 'POST',
        IntegrationType: 'AWS_PROXY',
        IntegrationUri: this._functionARN,
        PayloadFormatVersion: '2.0',
        TimeoutInMillis: Math.min(this._builder.timeout, 30000),
      }));
      this.log.info(`Created new integration "${integration.IntegrationId}" for "${this._functionARN}"`);
      const { IntegrationId } = integration;
      // need to create 2 routes. one for the exact path, and one with suffix
      await this._api.send(new CreateRouteCommand({
        ApiId,
        RouteKey: `ANY /${functionQName}/{path+}`,
        Target: `integrations/${IntegrationId}`,
      }));
      await this._api.send(new CreateRouteCommand({
        ApiId,
        RouteKey: `ANY /${functionQName}`,
        Target: `integrations/${IntegrationId}`,
      }));
    }

    // setup permissions. TODO: there must be a way to get the source arn for a route<->integration
    const sourceArn1 = `arn:aws:execute-api:${this._region}:${this._functionARN.split(':')[4]}:${ApiId}/*/*/${functionQName}`;
    const sourceArn2 = `${sourceArn1}/{path+}`;

    // eslint-disable-next-line no-restricted-syntax
    for (const sourceArn of [sourceArn1, sourceArn2]) {
      try {
        // eslint-disable-next-line no-await-in-loop
        res = await this._lambda.send(new AddPermissionCommand({
          FunctionName: this._functionARN,
          Action: 'lambda:InvokeFunction',
          SourceArn: sourceArn,
          Principal: 'apigateway.amazonaws.com',
          StatementId: crypto.createHash('md5').update(this._functionARN + sourceArn).digest('hex'),
        }));
        this.log.info(`Added invoke permissions for ${sourceArn}`);
      } catch (e) {
        // ignore, most likely the permission already exists
      }
    }
    if (this._builder.showHints) {
      const opts = '';
      this.log.info('\nYou can verify the action with:');
      this.log.info(chalk`{grey $ curl${opts} "${this._functionURL}"}`);
    }
  }

  async test() {
    if (!this._functionURL) {
      return '';
    }
    return this.testRequest({
      url: this._functionURL,
      idHeader: 'apigw-requestid',
      retry404: 5,
    });
  }

  get fullFunctionName() {
    return this._functionURL;
  }

  async updatePackage() {
    this.log.info('--: updating app (package) parameters ...');
    const commands = Object
      .entries(this._builder.packageParams)
      .map(([key, value]) => this._ssm.send(new PutParameterCommand({
        Name: `/helix-deploy/${this._builder.packageName}/${key}`,
        Value: value,
        Type: 'SecureString',
        DataType: 'text',
        Overwrite: true,
      })));

    await Promise.all(commands);

    this.log.info('parameters updated');
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

module.exports = AWSDeployer;
