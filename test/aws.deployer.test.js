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

describe('AWS Deployer Test', () => {
  beforeEach(() => {
    process.env.AWS_ACCESS_KEY_ID = 'fake';
    process.env.AWS_SECRET_ACCESS_KEY = 'fake';
    process.env.AWS_REGION = 'us-east-1';
  });

  afterEach(() => {
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    delete process.env.AWS_REGION;
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
    nock('https://sts.us-east-1.amazonaws.com/')
      .post('/')
      .reply(() => [200, new xml2js.Builder().buildObject({
        GetCallerIdentityResponse: {
          GetCallerIdentityResult: {
            Account: '118435662149',
          },
        },
      })]);

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
    assert.strictEqual(aws._bucket, 'helix-deploy-bucket-118435662149');
  });

  it('sets the default deploy bucket with region', async () => {
    nock('https://sts.eu-central-1.amazonaws.com/')
      .post('/')
      .reply(() => [200, new xml2js.Builder().buildObject({
        GetCallerIdentityResponse: {
          GetCallerIdentityResult: {
            Account: '118435662149',
          },
        },
      })]);

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
    assert.strictEqual(aws._bucket, 'helix-deploy-bucket-118435662149-eu-central-1');
  });

  it('sets the custom deploy bucket', async () => {
    nock('https://sts.eu-central-1.amazonaws.com/')
      .post('/')
      .reply(() => [200, new xml2js.Builder().buildObject({
        GetCallerIdentityResponse: {
          GetCallerIdentityResult: {
            Account: '118435662149',
          },
        },
      })]);

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
    process.env.AWS_ACCESS_KEY_ID = 'awsAccessKeyId';
    process.env.AWS_SECRET_ACCESS_KEY = 'awsSecretAccessKey';
    process.env.AWS_SESSION_TOKEN = 'awsSessionToken';

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
    process.env.AWS_ACCESS_KEY_ID = 'awsAccessKeyId';
    process.env.AWS_SECRET_ACCESS_KEY = 'awsSecretAccessKey';
    process.env.AWS_SESSION_TOKEN = 'awsSessionToken';

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
});
