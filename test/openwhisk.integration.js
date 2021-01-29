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

describe('OpenWhisk Integration Test', () => {
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

  it('Deploy to OpenWhisk (for real)', async () => {
    await fse.copy(path.resolve(__dirname, 'fixtures', 'simple'), testRoot);

    process.chdir(testRoot); // need to change .cwd() for yargs to pickup `wsk` in package.json
    const builder = new CLI()
      .prepare([
        '--build',
        '--verbose',
        '--deploy',
        '--target', 'wsk',
        '--test', '/foo',
        '--directory', testRoot,
        '--entryFile', 'index.js',
      ]);
    builder.cfg._logger = new TestLogger();

    const res = await builder.run();
    assert.ok(res);
    const out = builder.cfg._logger.output;
    const { auth, namespace } = builder._deployers.wsk._cfg;
    assert.ok(out.indexOf(`ok: 200
{"url":"https://azure.adobe-runtime.com/api/v1/web/${namespace}/simple-package/simple-name@1.45.0/foo","file":"Hello, world.\\n"}`) > 0, out);

    // try to invoke via openwhisk api
    const { fetch } = fetchContext();
    const auth64 = Buffer.from(auth).toString('base64');
    const resp = await fetch('https://adobeioruntime.net/api/v1/namespaces/_/actions/simple-package/simple-name@1.45.0?blocking=true&result=true', {
      method: 'POST',
      body: JSON.stringify({
        foo: 'bar',
        __ow_headers: {
          'x-forwarded-host': 'adobeioruntime.net',
        },
      }),
      headers: {
        'content-type': 'application/json',
        authorization: `Basic ${auth64}`,
      },
    });
    const ret = await resp.json();
    ret.body = JSON.parse(ret.body);
    assert.deepEqual(ret, {
      body: {
        file: 'Hello, world.\n',
        url: `https://adobeioruntime.net/api/v1/web/${namespace}/simple-package/simple-name@1.45.0?foo=bar`,
      },
      headers: {
        'content-type': 'text/plain; charset=utf-8',
      },
      statusCode: 200,
    });
  }).timeout(20000);
});
