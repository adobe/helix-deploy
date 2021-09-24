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

/* eslint-env mocha */
/* eslint-disable no-underscore-dangle */
const assert = require('assert');
const fse = require('fs-extra');
const path = require('path');
const fetchAPI = require('@adobe/helix-fetch');
const { createTestRoot, TestLogger } = require('./utils');
const CLI = require('../src/cli.js');

function fetchContext() {
  return process.env.HELIX_FETCH_FORCE_HTTP1
    ? fetchAPI.context({
      alpnProtocols: [fetchAPI.ALPN_HTTP1_1],
    })
    : fetchAPI;
}

describe('Gateway Integration Test', () => {
  let testRoot;
  let origPwd;

  beforeEach(async () => {
    testRoot = await createTestRoot();
    origPwd = process.cwd();
  });

  afterEach(async () => {
    process.chdir(origPwd);
    await fse.remove(testRoot);
  });

  it('Deploy to all Runtimes', async () => {
    await fse.copy(path.resolve(__dirname, 'fixtures', 'simple'), testRoot);

    process.chdir(testRoot); // need to change .cwd() for yargs to pickup `wsk` in package.json
    const builder = new CLI()
      .prepare([
        '--build',
        '--verbose',
        '--deploy',
        '--target', 'wsk',
        '--target', 'aws',
        '--target', 'google',
        '--target', 'azure',
        '--aws-region', 'us-east-1',
        '--aws-api', 'lqmig3v5eb',
        '--aws-role', 'arn:aws:iam::118435662149:role/helix-lambda-role',
        '--google-key-file', `${process.env.HOME}/.helix-google.json`,
        '--google-email', 'cloud-functions-dev@helix-225321.iam.gserviceaccount.com',
        '--google-project-id', 'helix-225321',
        '--google-region', 'us-central1',
        '--azure-app', 'deploy-helix',
        '--package.params', 'HEY=ho',
        '--update-package', 'true',
        '--check-interval', 60000000,
        '-p', 'FOO=bar',
        '--test', '/foo',
        '--checkpath', '/foo',
        '--directory', testRoot,
        '--entryFile', 'index.js',
        '--coralogix-token', process.env.CORALOGIX_TOKEN,
        '-l', 'latest',
        '-l', 'major',
        '-l', 'minor',
      ]);
    builder.cfg._logger = new TestLogger();

    const res = await builder.run();
    assert.ok(res);
    const out = builder.cfg._logger.output;
    const { namespace } = builder._deployers.wsk._cfg;
    assert.ok(out.indexOf(`ok: 200
{"url":"https://adobeioruntime.net/api/v1/web/${namespace}/simple-package/simple-name@1.45.0/foo?testPackageParam=42&test-package-param=42","file":"Hello, world.\\n"}`) > 0, out);

    const { fetch } = fetchContext();
    const respRandom = await fetch('https://deploy-test.anywhere.run/simple-package/simple-name@1.45.0/foo');
    const respOW = await fetch('https://deploy-test.anywhere.run/simple-package/simple-name@1.45.0/foo', {
      headers: {
        'x-ow-version-lock': 'env=openwhisk',
      },
    });
    const respAWS = await fetch('https://deploy-test.anywhere.run/simple-package/simple-name@1.45.0/foo', {
      headers: {
        'x-ow-version-lock': 'env=amazonwebservices',
      },
    });
    const respAzure = await fetch('https://deploy-test.anywhere.run/simple-package/simple-name@1.45.0/foo', {
      headers: {
        'x-ow-version-lock': 'env=azure',
      },
    });

    assert.ok(respRandom.ok, 'Randomly assigned request is OK');
    assert.ok(respOW.ok, 'OW request is not OK');
    assert.ok(respAWS.ok, 'AWS request is not OK');
    assert.ok(respAzure.ok, 'Azure request is not OK');

    await respRandom.text();
    await respOW.text();
    await respAWS.text();
    await respAzure.text();

    assert.ok(respOW.headers.get('X-Backend-Name'), 'OW: X-Backend-Name Header is missing');
    assert.ok(respAWS.headers.get('X-Backend-Name'), 'AWS: X-Backend-Name Header is missing');
    assert.ok(respAzure.headers.get('X-Backend-Name'), 'Azure: X-Backend-Name Header is missing');

    assert.ok(respOW.headers.get('X-Backend-Name').indexOf('Openwhisk') > 0,
      `OW: X-Backend-Name Header is wrong:${respOW.headers.get('X-Backend-Name')}`);

    assert.ok(respAWS.headers.get('X-Backend-Name').indexOf('AmazonWebServices') > 0,
      `AWS: X-Backend-Name Header is wrong:${respOW.headers.get('X-Backend-Name')}`);

    assert.ok(respAzure.headers.get('X-Backend-Name').indexOf('Azure') > 0,
      `Azure: X-Backend-Name Header is wrong:${respOW.headers.get('X-Backend-Name')}`);

    assert.equal(respAWS.headers.get('Surrogate-Key'), 'simple', 'AWS: Surrogate-Key not propagated');
    assert.equal(respOW.headers.get('Surrogate-Key'), 'simple', 'OW: Surrogate-Key not propagated');
    assert.equal(respAzure.headers.get('Surrogate-Key'), 'simple', 'Azure: Surrogate-Key not propagated');
  }).timeout(250000);
});
