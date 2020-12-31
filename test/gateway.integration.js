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
const { createTestRoot, TestLogger } = require('./utils');
const CLI = require('../src/cli.js');

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

  it('Deploy to AWS and OpenWhisk (for real)', async () => {
    await fse.copy(path.resolve(__dirname, 'fixtures', 'simple'), testRoot);

    process.chdir(testRoot); // need to change .cwd() for yargs to pickup `wsk` in package.json
    const builder = new CLI()
      .prepare([
        '--build',
        '--verbose',
        '--deploy',
        '--target', 'wsk',
        '--target', 'aws',
        '--aws-region', 'us-east-1',
        '--aws-api', 'lqmig3v5eb',
        '--aws-role', 'arn:aws:iam::118435662149:role/helix-lambda-role',
        '--package.params', 'HEY=ho',
        '--update-package', 'true',
        '-p', 'FOO=bar',
        '--test', '/foo',
        '--checkpath', '/foo',
        '--directory', testRoot,
        '--entryFile', 'index.js',
      ]);
    builder.cfg._logger = new TestLogger();

    const res = await builder.run();
    assert.ok(res);
    const out = builder.cfg._logger.output;
    const { namespace } = builder._deployers.wsk._cfg;
    assert.ok(out.indexOf(`ok: 200
{"url":"https://adobeioruntime.net/api/v1/web/${namespace}/simple-package/simple-name@1.45.0/foo","file":"Hello, world.\\n"}`) > 0, out);
  }).timeout(150000);
});
