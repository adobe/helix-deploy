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

const { fetch } = fetchAPI.context({
  httpProtocol: 'http1',
  httpsProtocols: ['http1'],
});

describe('AWS Integration Test', () => {
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

  it('Deploy to AWS (for real)', async () => {
    await fse.copy(path.resolve(__dirname, 'fixtures', 'simple'), testRoot);

    process.chdir(testRoot); // need to change .cwd() for yargs to pickup `wsk` in package.json
    const builder = new CLI()
      .prepare([
        '--build',
        '--verbose',
        '--deploy',
        '--target', 'aws',
        '--aws-region', 'us-east-1',
        '--aws-api', 'lqmig3v5eb',
        '--aws-role', 'arn:aws:iam::118435662149:role/service-role/helix-service-role-ogu32wiz',
        '--package.params', 'HEY=ho',
        '--update-package', 'true',
        '-p', 'FOO=bar',
        '--test', '/foo',
        '--directory', testRoot,
        '--entryFile', 'index.js',
      ]);
    builder.cfg._logger = new TestLogger();

    const res = await builder.run();
    assert.ok(res);
    const out = builder.cfg._logger.output;
    assert.ok(out.indexOf('https://lqmig3v5eb.execute-api.us-east-1.amazonaws.com/simple-package/simple-name/1.45.0/foo') > 0, `could not find deployed url in output: ${out}`);
  }).timeout(50000);

  it('Update links to AWS (for real)', async () => {
    await fse.copy(path.resolve(__dirname, 'fixtures', 'simple'), testRoot);

    process.chdir(testRoot); // need to change .cwd() for yargs to pickup `wsk` in package.json
    const builder = new CLI()
      .prepare([
        '--no-build',
        '--verbose',
        '-l', 'major',
        '--target', 'aws',
        '--aws-region', 'us-east-1',
        '--aws-api', 'lqmig3v5eb',
        '--aws-role', 'arn:aws:iam::118435662149:role/service-role/helix-service-role-ogu32wiz',
        '--directory', testRoot,
      ]);
    builder.cfg._logger = new TestLogger();

    const res = await builder.run();
    assert.equal(res, '');

    const ret = await fetch('https://lqmig3v5eb.execute-api.us-east-1.amazonaws.com/simple-package/simple-name/v1/foo');
    assert.ok(ret.ok);
    assert.equal(ret.status, 200);
    const text = await ret.text();
    assert.equal(text.trim(), '{"url":"https://lqmig3v5eb.execute-api.us-east-1.amazonaws.com/simple-package/simple-name/v1/foo","file":"Hello, world.\\n"}');
  }).timeout(50000);
});
