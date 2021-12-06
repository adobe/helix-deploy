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
import assert from 'assert';
import fse from 'fs-extra';
import path from 'path';
import { ALPN_HTTP1_1, context } from '@adobe/helix-fetch';

import { createTestRoot, TestLogger } from './utils.js';

import CLI from '../src/cli.js';

const { fetch } = context({
  alpnProtocols: [ALPN_HTTP1_1],
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
    await fse.copy(path.resolve(__rootdir, 'test', 'fixtures', 'simple'), testRoot);

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
        '--aws-create-routes', 'true',
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
    assert.ok(out.indexOf('{"url":"https://lqmig3v5eb.execute-api.us-east-1.amazonaws.com/simple-package/simple-name/1.45.0/foo","file":"Hello, world.\\n"}') >= 0, out);
  }).timeout(50000);

  it('Update links to AWS (for real)', async () => {
    await fse.copy(path.resolve(__rootdir, 'test', 'fixtures', 'simple'), testRoot);

    const version = `ci${process.env.CIRCLE_BUILD_NUM || Date.now()}`;
    process.chdir(testRoot); // need to change .cwd() for yargs to pickup `wsk` in package.json
    const builder = new CLI()
      .prepare([
        '--verbose',
        '--deploy',
        '--pkgVersion', version,
        '-l', 'major',
        '-l', 'ci',
        '--target', 'aws',
        '--aws-region', 'us-east-1',
        '--aws-api', 'lqmig3v5eb',
        '--aws-role', 'arn:aws:iam::118435662149:role/service-role/helix-service-role-ogu32wiz',
        '--directory', testRoot,
        '--entryFile', 'index.js',
      ]);
    builder.cfg._logger = new TestLogger();

    const res = await builder.run();
    assert.ok(res);
    const out = builder.cfg._logger.output;
    assert.ok(/.*deleted \d+ unused integrations.*/sg.test(out), out);

    // eslint-disable-next-line no-console
    console.log('testing if v1 link works...');
    let ret = await fetch('https://lqmig3v5eb.execute-api.us-east-1.amazonaws.com/simple-package/simple-name/v1/foo');
    assert.ok(ret.ok);
    assert.equal(ret.status, 200);
    let text = await ret.text();
    assert.equal(text.trim(), '{"url":"https://lqmig3v5eb.execute-api.us-east-1.amazonaws.com/simple-package/simple-name/v1/foo","file":"Hello, world.\\n"}');

    // eslint-disable-next-line no-console
    console.log('testing if ci link works...');
    ret = await fetch('https://lqmig3v5eb.execute-api.us-east-1.amazonaws.com/simple-package/simple-name/ci/foo');
    assert.ok(ret.ok);
    assert.equal(ret.status, 200);
    text = await ret.text();
    assert.equal(text.trim(), '{"url":"https://lqmig3v5eb.execute-api.us-east-1.amazonaws.com/simple-package/simple-name/ci/foo","file":"Hello, world.\\n"}');
  }).timeout(50000);
});
