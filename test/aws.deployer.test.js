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
const assert = require('assert');
const BaseConfig = require('../src/BaseConfig.js');
const AWSConfig = require('../src/deploy/AWSConfig.js');
const AWSDeployer = require('../src/deploy/AWSDeployer.js');
const ActionBuilder = require('../src/ActionBuilder.js');

describe('AWS Deployer Test', () => {
  it('sets the default lambda name', async () => {
    const cfg = new BaseConfig()
      .withName('/helix-services/static@4.3.1');
    const awsCfg = new AWSConfig();
    const builder = new ActionBuilder().withConfig(cfg);
    await builder.validate();
    const aws = new AWSDeployer(cfg, awsCfg);

    assert.strictEqual(aws.functionName, 'helix-services--static');
  });

  it('sets the default lambda with dots', async () => {
    const cfg = new BaseConfig()
      .withName('/helix-services/gorky.v8@4.3.1');
    const awsCfg = new AWSConfig();
    const builder = new ActionBuilder().withConfig(cfg);
    await builder.validate();
    const aws = new AWSDeployer(cfg, awsCfg);

    assert.strictEqual(aws.functionName, 'helix-services--gorky_v8');
  });

  it('sets the default function path', async () => {
    const cfg = new BaseConfig()
      .withName('/helix-services/static@4.3.1');
    const awsCfg = new AWSConfig();
    const builder = new ActionBuilder().withConfig(cfg);
    await builder.validate();
    const aws = new AWSDeployer(cfg, awsCfg);

    assert.strictEqual(aws.functionPath, '/helix-services/static/1.18.2');
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
  });
});
