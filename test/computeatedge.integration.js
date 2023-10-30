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

describe('Fastly Compute@Edge Integration Test', () => {
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

  it('Deploy a pure action to Compute@Edge', async () => {
    const serviceID = '1yv1Wl7NQCFmNBkW4L8htc';

    await fse.copy(path.resolve(__rootdir, 'test', 'fixtures', 'edge-action'), testRoot);
    process.chdir(testRoot); // need to change .cwd() for yargs to pickup `wsk` in package.json
    const builder = new CLI()
      .prepare([
        '--build',
        '--verbose',
        '--deploy',
        '--target', 'c@e',
        '--arch', 'node', // TODO: make obsolete
        '--arch', 'edge',
        '--compute-service-id', serviceID,
        '--compute-test-domain', 'possibly-working-sawfish',
        '--package.name', 'Test',
        '--package.params', 'HEY=ho',
        '--package.params', 'ZIP=zap',
        '--update-package', 'true',
        '--fastly-gateway', 'deploy-test.anywhere.run',
        '-p', 'FOO=bar',
        '--test', '/201',
        '--directory', testRoot,
        '--entryFile', 'src/index.js',
      ]);
    builder.cfg._logger = new TestLogger();

    const res = await builder.run();
    assert.ok(res);
    const out = builder.cfg._logger.output;
    assert.ok(out.indexOf('possibly-working-sawfish.edgecompute.app') > 0, out);
    assert.ok(out.indexOf(`(${serviceID}) ok:`) > 0, `The function output should include the service ID: ${out}`);
    assert.ok(out.indexOf('dist/Test/fastly-bundle.tar.gz') > 0, out);
  }).timeout(10000000);
});
