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

/* eslint-env mocha */
import assert from 'assert';
import nock from 'nock';
import xml2js from 'xml2js';

import BaseConfig from '../src/BaseConfig.js';
import AWSConfig from '../src/deploy/AWSConfig.js';
import AWSDeployer from '../src/deploy/AWSDeployer.js';
import ActionBuilder from '../src/ActionBuilder.js';

const AWS_CREDENTIALS = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_SESSION_TOKEN',
];

const env = {};
const awsNock = {
  getCallerIdentity: (region = 'us-east-1') => nock(`https://sts.${region}.amazonaws.com`)
    .post('/', (body) => body.Action === 'GetCallerIdentity')
    .reply(200, new xml2js.Builder().buildObject({
      GetCallerIdentityResponse: {
        GetCallerIdentityResult: {
          Arn: 'arn:aws:sts::123456789012:assumed-role/master-role-ab5CD/bob',
          UserId: 'ABCD:bob',
          Account: '123456789012',
        },
      },
    })),
};

describe('AWS Deployer Test', () => {
  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  beforeEach(() => {
    awsNock.getCallerIdentity('us-east-1');
    awsNock.getCallerIdentity('eu-central-1');
    AWS_CREDENTIALS.forEach((cred) => {
      env[cred] = process.env[cred];
      if (process.env[cred] === undefined) {
        process.env[cred] = 'test';
      }
    });
  });

  afterEach(() => {
    AWS_CREDENTIALS.forEach((cred) => {
      if (env[cred] !== undefined) {
        process.env[cred] = env[cred];
      } else {
        delete process.env[cred];
      }
    });
  });
  it('sets the default lambda name', async () => {
    const cfg = new BaseConfig()
      .withName('/helix-services/static@4.3.1');
    const awsCfg = new AWSConfig();
    const builder = new ActionBuilder().withConfig(cfg);
    await builder.validate();
    const aws = new AWSDeployer(cfg, awsCfg);

    assert.strictEqual(aws.functionName, 'helix-services--static');
    assert.strictEqual(aws.functionConfig.FunctionName, 'helix-services--static');
  });

  it('sets the default lambda with dots', async () => {
    const cfg = new BaseConfig()
      .withName('/helix-services/gorky.v8@4.3.1');
    const awsCfg = new AWSConfig();
    const builder = new ActionBuilder().withConfig(cfg);
    await builder.validate();
    const aws = new AWSDeployer(cfg, awsCfg);

    assert.strictEqual(aws.functionName, 'helix-services--gorky_v8');
    assert.strictEqual(aws.functionConfig.FunctionName, 'helix-services--gorky_v8');
  });

  it('sets the default function path', async () => {
    const cfg = new BaseConfig()
      .withVersion('1.18.2')
      // eslint-disable-next-line no-template-curly-in-string
      .withName('/helix-services/static@${version}');
    const awsCfg = new AWSConfig();
    const builder = new ActionBuilder().withConfig(cfg);
    await builder.validate();
    const aws = new AWSDeployer(cfg, awsCfg);

    assert.strictEqual(aws.functionPath, '/helix-services/static/1.18.2');
  });

  it('sets the default deploy bucket', async () => {
    const cfg = new BaseConfig()
      .withVersion('1.18.2')
      // eslint-disable-next-line no-template-curly-in-string
      .withName('/helix-services/static@${version}');
    const awsCfg = new AWSConfig()
      .withAWSRegion('us-east-1');
    const aws = new AWSDeployer(cfg, awsCfg);
    // eslint-disable-next-line no-underscore-dangle
    await aws.init();
    await aws.initAccountId();
    // eslint-disable-next-line no-underscore-dangle
    const { _bucket: bucket, _accountId: accountId } = aws;
    assert.strictEqual(bucket, `helix-deploy-bucket-${accountId}`);
  });

  it('sets the default deploy bucket with region', async () => {
    const cfg = new BaseConfig()
      .withVersion('1.18.2')
      // eslint-disable-next-line no-template-curly-in-string
      .withName('/helix-services/static@${version}');
    const awsCfg = new AWSConfig()
      .withAWSRegion('eu-central-1');
    const aws = new AWSDeployer(cfg, awsCfg);
    await aws.init();
    await aws.initAccountId();
    // eslint-disable-next-line no-underscore-dangle
    const { _bucket: bucket, _accountId: accountId } = aws;
    assert.strictEqual(bucket, `helix-deploy-bucket-${accountId}-eu-central-1`);
  });

  it('sets the custom deploy bucket', async () => {
    const cfg = new BaseConfig()
      .withVersion('1.18.2')
      // eslint-disable-next-line no-template-curly-in-string
      .withName('/helix-services/static@${version}');
    const awsCfg = new AWSConfig()
      .withAWSRegion('eu-central-1')
      .withAWSDeployBucket('my-bucket');
    const aws = new AWSDeployer(cfg, awsCfg);
    await aws.init();
    await aws.initAccountId();
    // eslint-disable-next-line no-underscore-dangle
    assert.strictEqual(aws._bucket, 'my-bucket');
  });

  it('can configure lambda name and format', async () => {
    const cfg = new BaseConfig()
      .withVersion('4.3.1')
      .withProperties({
        scriptName: 'html',
      })
      .withFormat({
        // eslint-disable-next-line no-template-curly-in-string
        aws: '/pages_${version}/${scriptName}',
      });
    const awsCfg = new AWSConfig()
      // eslint-disable-next-line no-template-curly-in-string
      .withAWSLambdaFormat('pages--${scriptName}');
    const builder = new ActionBuilder().withConfig(cfg);
    await builder.validate();
    const aws = new AWSDeployer(cfg, awsCfg);

    assert.strictEqual(aws.functionName, 'pages--html');
    assert.strictEqual(aws.functionPath, '/pages_4.3.1/html');
    assert.strictEqual(aws.functionConfig.FunctionName, 'pages--html');
  });

  it('cleans up old versions', async () => {
    nock('https://lambda.us-east-1.amazonaws.com')
      .get('/2015-03-31/functions/helix-services--static/aliases')
      .reply(200, {
        Aliases: [{
          Description: '',
          FunctionVersion: '839',
          Name: '5_7_9',
        }, {
          Description: '',
          FunctionVersion: '838',
          Name: 'ci1234',
        }],
      })
      .get('/2015-03-31/functions/helix-services--static/versions')
      .reply(200, {
        Versions: [{
          LastModified: '2023-12-24T22:59:00.000+0000',
          Version: '$LATEST',
        }, {
          LastModified: '2023-12-24T22:58:00.000+0000',
          Version: '839',
        }, {
          LastModified: '2023-12-24T22:57:00.000+0000',
          Version: '838',
        }],
      })
      .delete('/2015-03-31/functions/helix-services--static/aliases/ci1234')
      .reply(204)
      .delete('/2015-03-31/functions/helix-services--static?Qualifier=838')
      .reply(204);

    const cfg = new BaseConfig()
      .withVersion('1.18.2')
      // eslint-disable-next-line no-template-curly-in-string
      .withName('/helix-services/static@${version}')
      .withCleanupCi(86400);
    const awsCfg = new AWSConfig().withAWSRegion('us-east-1');
    const builder = new ActionBuilder().withConfig(cfg);
    await builder.validate();

    const aws = new AWSDeployer(cfg, awsCfg);
    await aws.init();
    await aws.cleanup();
  });

  it('cleans up unused versions', async () => {
    nock('https://lambda.us-east-1.amazonaws.com')
      .get('/2015-03-31/functions/helix-services--static/aliases')
      .reply(200, {
        Aliases: [{
          Description: '',
          FunctionVersion: '839',
          Name: '5_7_9',
        }, {
          Description: '',
          FunctionVersion: '838',
          Name: 'ci1234',
        }],
      })
      .get('/2015-03-31/functions/helix-services--static/versions')
      .reply(200, {
        Versions: [{
          LastModified: '2023-12-24T22:59:00.000+0000',
          Version: '$LATEST',
        }, {
          LastModified: '2023-12-24T22:58:00.000+0000',
          Version: '839',
        }, {
          LastModified: '2023-12-24T22:57:00.000+0000',
          Version: '838',
        }, {
          LastModified: '2023-12-24T22:56:00.000+0000',
          Version: '837',
        }],
      })
      .delete('/2015-03-31/functions/helix-services--static?Qualifier=837')
      .reply(204);

    const cfg = new BaseConfig()
      .withVersion('1.18.2')
      // eslint-disable-next-line no-template-curly-in-string
      .withName('/helix-services/static@${version}');
    const awsCfg = new AWSConfig().withAWSRegion('us-east-1').withAWSCleanUpVersions(true);
    const builder = new ActionBuilder().withConfig(cfg);
    await builder.validate();

    const aws = new AWSDeployer(cfg, awsCfg);
    await aws.init();
    await aws.cleanUpVersions();
  });

  it('correctly returns an empty object when no tags', async () => {
    const cfg = new BaseConfig()
      .withVersion('1.18.2')
      // eslint-disable-next-line no-template-curly-in-string
      .withName('/helix-services/static@${version}');
    const awsCfg = new AWSConfig();
    const builder = new ActionBuilder().withConfig(cfg);
    await builder.validate();
    const aws = new AWSDeployer(cfg, awsCfg);

    assert.deepStrictEqual(aws.additionalTags, {});
    assert.strictEqual(Object.keys(aws.functionConfig.Tags).length, 4);
  });

  it('correctly transforms tags into an object', async () => {
    const cfg = new BaseConfig()
      .withVersion('1.18.2')
      // eslint-disable-next-line no-template-curly-in-string
      .withName('/helix-services/static@${version}');
    const awsCfg = new AWSConfig().withAWSTags(['foo=bar', 'baz=qux=quux']);
    const builder = new ActionBuilder().withConfig(cfg);
    await builder.validate();
    const aws = new AWSDeployer(cfg, awsCfg);

    assert.deepStrictEqual(aws.additionalTags, {
      foo: 'bar',
      baz: 'qux=quux',
    });
    assert.strictEqual(aws.functionConfig.Tags.foo, 'bar');
    assert.strictEqual(aws.functionConfig.Tags.baz, 'qux=quux');
  });

  it('creates an error if awsTags is set as an object', async () => {
    assert.throws(() => new AWSConfig().withAWSTags({ foo: 'bar' }), {
      name: 'Error',
      message: 'awsTags must be an array',
    });
  });

  it('correctly uses awsHandler', async () => {
    const cfg = new BaseConfig()
      .withVersion('1.18.2')
      // eslint-disable-next-line no-template-curly-in-string
      .withName('/helix-services/static@${version}');
    const awsCfg = new AWSConfig()
      .withAWSRegion('us-east-1')
      .withAWSHandler('custom.handler');
    const builder = new ActionBuilder().withConfig(cfg);
    await builder.validate();

    const aws = new AWSDeployer(cfg, awsCfg);

    assert.strictEqual(aws.functionConfig.Handler, 'custom.handler');
  });

  // https://github.com/adobe/helix-deploy/issues/734
  it('uses empty array for Layers if no awsLayers is configured', async () => {
    const cfg = new BaseConfig();
    const awsCfg = new AWSConfig();
    const builder = new ActionBuilder().withConfig(cfg);
    await builder.validate();

    const aws = new AWSDeployer(cfg, awsCfg);
    assert.deepEqual(aws.functionConfig.Layers, []);
  });

  it('sets Layers if awsLayers is configured (1)', async () => {
    const cfg = new BaseConfig();
    const awsCfg = new AWSConfig().withAWSLayers(['my-layer:1']);
    const builder = new ActionBuilder().withConfig(cfg);
    await builder.validate();

    const aws = new AWSDeployer(cfg, awsCfg);
    assert.deepEqual(aws.functionConfig.Layers, ['my-layer:1']);
  });

  it('sets Layers if awsLayers is configured (2)', async () => {
    const cfg = new BaseConfig();
    const awsCfg = new AWSConfig().withAWSLayers(['my-layer:1', 'my-other-layer:1']);
    const builder = new ActionBuilder().withConfig(cfg);
    await builder.validate();

    const aws = new AWSDeployer(cfg, awsCfg);
    assert.deepEqual(aws.functionConfig.Layers, ['my-layer:1', 'my-other-layer:1']);
  });

  async function createBaseConfig({
    version = '1.18.2',
    // eslint-disable-next-line no-template-curly-in-string
    name = '/helix-services/static@${version}',
    links = [],
  } = {}) {
    const cfg = new BaseConfig()
      .withVersion(version)
      .withName(name)
      .withLinks(links);
    const builder = new ActionBuilder().withConfig(cfg);
    await builder.validate();
    return cfg;
  }

  it('skips linking routes when linkRoutes is disabled', async () => {
    const cfg = await createBaseConfig({ links: ['ci'] });
    const awsCfg = new AWSConfig()
      .withAWSRegion('us-east-1')
      .withAWSLinkRoutes(false);
    const aws = new AWSDeployer(cfg, awsCfg);
    const lambdaScope = nock('https://lambda.us-east-1.amazonaws.com')
      .get('/2015-03-31/functions/helix-services--static/aliases/1_18_2')
      .reply(200, {
        FunctionVersion: '123',
        AliasArn: 'arn:aws:lambda:us-east-1:123456789012:function:helix-services--static:1_18_2',
      })
      .get('/2015-03-31/functions/helix-services--static/aliases/ci')
      .reply(200, {
        FunctionVersion: '123',
        AliasArn: 'arn:aws:lambda:us-east-1:123456789012:function:helix-services--static:ci',
      })
      .put('/2015-03-31/functions/helix-services--static/aliases/ci')
      .reply(200, {
        AliasArn: 'arn:aws:lambda:us-east-1:123456789012:function:helix-services--static:ci',
      });

    await aws.init();
    await aws.updateLinks();

    assert.ok(lambdaScope.isDone());
  });

  // These createAPI() tests only verify the guard around the "create" code path.
  // Each relies on nock failing if additional API Gateway endpoints are invoked,
  // so a passing test proves createAPI() returned (or continued) exactly as intended.
  it('skips API provisioning when apiId is not create', async () => {
    const cfg = await createBaseConfig();
    const awsCfg = new AWSConfig()
      .withAWSRegion('us-east-1')
      .withAWSApi('someapi');
    const aws = new AWSDeployer(cfg, awsCfg);
    const apiScope = nock('https://apigateway.us-east-1.amazonaws.com')
      .get('/v2/apis/someapi')
      .reply(200, {
        apiId: 'someapi',
        apiEndpoint: 'https://example.execute-api.us-east-1.amazonaws.com',
      });

    await aws.init();
    await aws.createAPI();

    assert.ok(apiScope.isDone());
    assert.strictEqual(aws.fullFunctionName, `https://example.execute-api.us-east-1.amazonaws.com${aws.functionPath}`);
  });

  it('creates stage when apiId equals create', async () => {
    const cfg = await createBaseConfig();
    const awsCfg = new AWSConfig()
      .withAWSRegion('us-east-1')
      .withAWSApi('create');
    const aws = new AWSDeployer(cfg, awsCfg);
    const apiBase = 'https://apigateway.us-east-1.amazonaws.com';
    const createApiRequest = nock(apiBase)
      .post('/v2/apis', () => true)
      .reply(200, {
        apiId: 'newapi',
        apiEndpoint: 'https://example.execute-api.us-east-1.amazonaws.com',
      });
    const getStagesRequest = nock(apiBase)
      .get('/v2/apis/newapi/stages')
      .reply(200, { items: [] });
    const createStageRequest = nock(apiBase)
      .post('/v2/apis/newapi/stages', (body) => body.stageName === '$default' && body.autoDeploy === true)
      .reply(201, {});

    await aws.init();
    await aws.initAccountId();
    await aws.createAPI();

    assert.ok(createApiRequest.isDone());
    assert.ok(getStagesRequest.isDone());
    assert.ok(createStageRequest.isDone());
    assert.strictEqual(aws.fullFunctionName, `https://example.execute-api.us-east-1.amazonaws.com${aws.functionPath}`);
  });
});
