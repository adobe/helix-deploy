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

  it.only('Deploy to AWS (for real)', async () => {
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
    assert.strictEqual(ret.status, 200);
    let text = await ret.text();
    assert.strictEqual(text.trim(), '{"url":"https://lqmig3v5eb.execute-api.us-east-1.amazonaws.com/simple-package/simple-name/v1/foo","file":"Hello, world.\\n"}');

    // eslint-disable-next-line no-console
    console.log('testing if ci link works...');
    ret = await fetch('https://lqmig3v5eb.execute-api.us-east-1.amazonaws.com/simple-package/simple-name/ci/foo');
    assert.ok(ret.ok);
    assert.strictEqual(ret.status, 200);
    text = await ret.text();
    assert.strictEqual(text.trim(), '{"url":"https://lqmig3v5eb.execute-api.us-east-1.amazonaws.com/simple-package/simple-name/ci/foo","file":"Hello, world.\\n"}');
  }).timeout(50000);

  it('Deploy authorizer and link it', async () => {
    const testRoot1 = path.resolve(testRoot, 'authorizer');
    await fse.copy(path.resolve(__rootdir, 'test', 'fixtures', 'simple-authorizer'), testRoot1);
    await fse.ensureDir(testRoot1);
    const testRoot2 = path.resolve(testRoot, 'simple');
    await fse.copy(path.resolve(__rootdir, 'test', 'fixtures', 'simple'), testRoot2);
    await fse.ensureDir(testRoot2);

    // build and link authorizer
    const version = `ci${process.env.CIRCLE_BUILD_NUM || Date.now()}`;
    process.chdir(testRoot1);
    let builder = new CLI()
      .prepare([
        '--verbose',
        '--deploy',
        '--pkgVersion', version,
        '-l', 'ci',
        '--target', 'aws',
        '--aws-region', 'us-east-1',
        '--aws-api', 'lqmig3v5eb',
        '--aws-role', 'arn:aws:iam::118435662149:role/service-role/helix-service-role-ogu32wiz',
        '--directory', testRoot1,
        '--entryFile', 'index.js',
      ]);
    builder.cfg._logger = new TestLogger();

    let res = await builder.run();
    assert.ok(res);
    let out = builder.cfg._logger.output;
    assert.ok(/.*updated authorizer: helix-simple-test-authorizer_ci.*/sg.test(out), out);

    // now link authorizer to simple package route
    process.chdir(testRoot2);
    builder = new CLI()
      .prepare([
        '--verbose',
        '--no-build',
        '-l', 'ci',
        '--target', 'aws',
        '--aws-attach-authorizer', 'helix-simple-test-authorizer_ci',
        '--aws-region', 'us-east-1',
        '--aws-role', 'arn:aws:iam::118435662149:role/service-role/helix-service-role-ogu32wiz',
        '--aws-api', 'lqmig3v5eb',
        '--directory', testRoot2,
      ]);
    builder.cfg._logger = new TestLogger();
    res = await builder.run();
    out = builder.cfg._logger.output;
    assert.ok(/.*configuring routes with authorizer helix-simple-test-authorizer_ci.*/sg.test(out), out);

    // eslint-disable-next-line no-console
    console.log('invoking w/o token should fail');
    let ret = await fetch('https://lqmig3v5eb.execute-api.us-east-1.amazonaws.com/simple-package/simple-name/ci/foo');
    assert.strictEqual(ret.status, 401);

    // eslint-disable-next-line no-console
    console.log('invoking with token token should succeed');
    ret = await fetch('https://lqmig3v5eb.execute-api.us-east-1.amazonaws.com/simple-package/simple-name/ci/foo', {
      headers: {
        'x-test-authorization': 'test',
      },
    });
    const text = await ret.text();
    assert.strictEqual(ret.status, 200);
    assert.strictEqual(text.trim(), '{"url":"https://lqmig3v5eb.execute-api.us-east-1.amazonaws.com/simple-package/simple-name/ci/foo","file":"Hello, world.\\n"}');
  }).timeout(50000);
});
