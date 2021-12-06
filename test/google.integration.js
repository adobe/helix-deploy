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
/* eslint-disable no-underscore-dangle */
import assert from 'assert';
import fse from 'fs-extra';
import path from 'path';
import { createTestRoot, TestLogger } from './utils.js';

import CLI from '../src/cli.js';

describe('Google Integration Test', () => {
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

  it('Deploy an older version to Google', async () => {
    await fse.copy(path.resolve(__rootdir, 'test', 'fixtures', 'simple-but-older'), testRoot);
    process.chdir(testRoot); // need to change .cwd() for yargs to pickup `wsk` in package.json
    const builder = new CLI()
      .prepare([
        '--build',
        '--verbose',
        '--deploy',
        '--target', 'google',
        '--google-key-file', `${process.env.HOME}/.helix-google.json`,
        '--google-email', 'cloud-functions-dev@helix-225321.iam.gserviceaccount.com',
        '--google-project-id', 'helix-225321',
        '--google-region', 'us-central1',
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
    assert.ok(out.indexOf('{"url":"https://us-central1-helix-225321.cloudfunctions.net/simple-package--simple-name_1_44_9/foo","file":"Hello, world.\\n"}') > 0, out);
  }).timeout(10000000);

  it('Deploy a newer version to Google and clean up', async () => {
    await fse.copy(path.resolve(__rootdir, 'test', 'fixtures', 'simple'), testRoot);
    process.chdir(testRoot); // need to change .cwd() for yargs to pickup `wsk` in package.json
    const builder = new CLI()
      .prepare([
        '--build',
        '--verbose',
        '--deploy',
        '--target', 'google',
        '--google-key-file', `${process.env.HOME}/.helix-google.json`,
        '--google-email', 'cloud-functions-dev@helix-225321.iam.gserviceaccount.com',
        '--google-project-id', 'helix-225321',
        '--google-region', 'us-central1',
        '--package.params', 'HEY=ho',
        '--update-package', 'true',
        '-p', 'FOO=bar',
        '--test', '/foo',
        '--directory', testRoot,
        '--entryFile', 'index.js',
        '--cleanup-minor', '1s', // cleanup the previous deployment
      ]);
    builder.cfg._logger = new TestLogger();

    const res = await builder.run();
    assert.ok(res);
    const out = builder.cfg._logger.output;
    assert.ok(out.indexOf('{"url":"https://us-central1-helix-225321.cloudfunctions.net/simple-package--simple-name_1_45_0/foo","file":"Hello, world.\\n"}') > 0, out);
  }).timeout(10000000);

  it('Deploy Simple Status action to Google', async () => {
    await fse.copy(path.resolve(__rootdir, 'test', 'fixtures', 'status'), testRoot);

    process.chdir(testRoot); // need to change .cwd() for yargs to pickup `wsk` in package.json
    const builder = new CLI()
      .prepare([
        '--build',
        '--verbose',
        '--deploy',
        '--target', 'google',
        '--google-key-file', `${process.env.HOME}/.helix-google.json`,
        '--google-email', 'cloud-functions-dev@helix-225321.iam.gserviceaccount.com',
        '--google-project-id', 'helix-225321',
        '--google-region', 'us-central1',
        '--package.params', 'HEY=ho',
        '--update-package', 'true',
        '-p', 'FOO=bar',
        '--test', '/foo',
        '--directory', testRoot,
        '--entryFile', 'src/index.js',
      ]);
    builder.cfg._logger = new TestLogger();

    const res = await builder.run();
    assert.ok(res);
    const out = builder.cfg._logger.output;
    assert.ok(out.indexOf('{"status":"OK","version":"1.45.0"') > 0, out);
  }).timeout(10000000);
});
