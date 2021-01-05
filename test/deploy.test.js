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
const path = require('path');
const fse = require('fs-extra');
const nock = require('nock');
const { createTestRoot, TestLogger } = require('./utils');

process.env.HELIX_FETCH_FORCE_HTTP1 = 'true';

const CLI = require('../src/cli.js');
const BaseDeployer = require('../src/deploy/BaseDeployer');

describe('Deploy Test', () => {
  let testRoot;
  let origPwd;
  let origEnv;

  beforeEach(async () => {
    testRoot = await createTestRoot();
    origPwd = process.cwd();
    origEnv = { ...process.env };

    // set fake wsk props
    process.env.WSK_NAMESPACE = 'foobar';
    process.env.WSK_APIHOST = 'https://example.com';
    process.env.WSK_AUTH = 'fake-key';
  });

  afterEach(async () => {
    process.chdir(origPwd);
    await fse.remove(testRoot);

    process.env = origEnv;
  });

  it('reports nice error if no wsk props are set', async () => {
    await fse.copy(path.resolve(__dirname, 'fixtures', 'web-action'), testRoot);
    process.chdir(testRoot); // need to change .cwd() for yargs to pickup `wsk` in package.json
    const builder = new CLI()
      .prepare([
        '--target', 'wsk',
        '--verbose',
        '--deploy',
        '--directory', testRoot,
      ]);
    // hack to invalidate the wsk props, if any
    builder._deployers.wsk.init = () => {};

    await assert.rejects(builder.run(), /Openwhisk target needs --wsk-host, --wsk-auth and --wsk-namespace/);
  });

  it('reports error configured namespace does not match wsk namespace', async () => {
    await fse.copy(path.resolve(__dirname, 'fixtures', 'web-action'), testRoot);
    process.chdir(testRoot); // need to change .cwd() for yargs to pickup `wsk` in package.json
    const builder = new CLI()
      .prepare([
        '--target', 'wsk',
        '--verbose',
        '--deploy',
        '--namespace', 'baz',
        '--directory', testRoot,
      ]);
    await assert.rejects(builder.run(), /Error: Openhwhisk namespace .*'foobar'.* doesn't match configured namespace .*'baz'.*./);
  });

  it('deploys a web action', async () => {
    await fse.copy(path.resolve(__dirname, 'fixtures', 'web-action'), testRoot);

    nock(process.env.WSK_APIHOST)
      // .log(console.log)
      .put('/api/v1/namespaces/foobar/actions/simple-project?overwrite=true')
      .reply(201, {
        namespace: process.env.WSK_NAMESPACE,
      })
      .get('/api/v1/web/foobar/default/simple-project/foo')
      .reply(200, 'ok');

    process.chdir(testRoot); // need to change .cwd() for yargs to pickup `wsk` in package.json
    const builder = new CLI()
      .prepare([
        '--target', 'wsk',
        '--verbose',
        '--deploy',
        '--test', '/foo',
        '--directory', testRoot,
      ]);
    builder.cfg._logger = new TestLogger();

    const res = await builder.run();
    assert.deepEqual(res, {
      wsk: {
        name: 'openwhisk;host=https://example.com',
        url: '/foobar/default/simple-project',
      },
    });

    const out = builder.cfg.log.output;
    assert.ok(out.indexOf('$ curl "https://example.com/api/v1/web/foobar/default/simple-project"') > 0);
  });

  it('tests a web action with redirect', async () => {
    await fse.copy(path.resolve(__dirname, 'fixtures', 'web-action'), testRoot);

    nock(process.env.WSK_APIHOST)
      .get('/api/v1/web/foobar/default/simple-project/foo')
      .reply(302, 'ok', {
        location: 'https://example.com/',
      });
    process.chdir(testRoot); // need to change .cwd() for yargs to pickup `wsk` in package.json
    const builder = new CLI()
      .prepare([
        '--target', 'wsk',
        '--verbose',
        '--no-build',
        '--test', '/foo',
        '--directory', testRoot,
      ]);
    builder.cfg._logger = new TestLogger();

    await builder.run();
    const out = builder.cfg.log.output;
    assert.ok(out.indexOf('requesting: https://example.com/api/v1/web/foobar/default/simple-project/foo') > 0);
    assert.ok(out.indexOf('Location: https://example.com/') > 0);
  });

  it('test can retry with 404', async () => {
    nock('https://www.example.com')
      .get('/action/404/foo')
      .reply(404)
      .get('/action/404/foo')
      .reply(200);
    const builder = new CLI()
      .prepare([
        '--target', 'wsk',
        '--verbose',
        '--no-build',
        '--test', '/foo',
        '--directory', testRoot,
      ]);
    builder.cfg._logger = new TestLogger();
    const deployer = new BaseDeployer(builder.cfg);
    await deployer.testRequest({
      url: 'https://www.example.com/action/404',
      retry404: 1,
    });
    const out = builder.cfg.log.output;

    assert.ok(out.indexOf('warn: 404 (retry)') > 0);
    assert.ok(out.indexOf('ok: 200') > 0);
  }).timeout(3000);

  it('test can retry with 404 but fails', async () => {
    nock('https://www.example.com')
      .get('/action/404/foo')
      .twice()
      .reply(404);
    const builder = new CLI()
      .prepare([
        '--target', 'wsk',
        '--verbose',
        '--no-build',
        '--test', '/foo',
        '--directory', testRoot,
      ]);
    builder.cfg._logger = new TestLogger();
    const deployer = new BaseDeployer(builder.cfg);
    await assert.rejects(
      deployer.testRequest({
        url: 'https://www.example.com/action/404',
        retry404: 1,
      }),
      Error('test failed: 404 '),
    );
    const out = builder.cfg.log.output;

    assert.ok(out.indexOf('warn: 404 (retry)') > 0);
  }).timeout(3000);

  it('deploys a web action with package', async () => {
    await fse.copy(path.resolve(__dirname, 'fixtures', 'web-action-with-package'), testRoot);

    nock(process.env.WSK_APIHOST)
      .put('/api/v1/namespaces/foobar/actions/test-package/simple-project?overwrite=true')
      .reply(201, {
        // openwhisk returns the package in the namespace property!
        namespace: `${process.env.WSK_NAMESPACE}/test-package`,
      });

    process.chdir(testRoot); // need to change .cwd() for yargs to pickup `wsk` in package.json
    const builder = new CLI()
      .prepare([
        '--target', 'wsk',
        '--verbose',
        '--deploy',
        '--directory', testRoot,
      ]);
    builder.cfg._logger = new TestLogger();

    const res = await builder.run();
    assert.deepEqual(res, {
      wsk: {
        name: 'openwhisk;host=https://example.com',
        url: '/foobar/test-package/simple-project',
      },
    });

    const out = builder.cfg.log.output;
    assert.ok(out.indexOf('$ curl "https://example.com/api/v1/web/foobar/test-package/simple-project"') > 0);
  });

  it.skip('deploys a pure action', async () => {
    await fse.copy(path.resolve(__dirname, 'fixtures', 'pure-action'), testRoot);

    nock(process.env.WSK_APIHOST)
      // .log(console.log)
      .put('/api/v1/namespaces/foobar/actions/simple-project?overwrite=true')
      .reply(201, {
        // openwhisk returns the package in the namespace property!
        namespace: `${process.env.WSK_NAMESPACE}/test-package`,
      })
      .post('/api/v1/namespaces/foobar/actions/simple-project?blocking=true')
      .reply(200, {
        response: {
          result: 'ok',
        },
      });

    process.chdir(testRoot); // need to change .cwd() for yargs to pickup `wsk` in package.json
    const builder = new CLI()
      .prepare([
        '--verbose',
        '--deploy',
        '--test-params', 'foo=bar',
        '--directory', testRoot,
      ]);
    builder.cfg._logger = new TestLogger();

    const res = await builder.run();
    assert.deepEqual(res, {
      wsk: {
        name: 'openwhisk;host=https://example.com',
        url: '/foobar/default/simple-project',
      },
    });

    const out = builder.cfg.log.output;
    assert.ok(out.indexOf('$ wsk action invoke -r /foobar/default/simple-project') > 0);
  });

  it.skip('deploys a pure action with package', async () => {
    await fse.copy(path.resolve(__dirname, 'fixtures', 'pure-action-with-package'), testRoot);

    nock(process.env.WSK_APIHOST)
      // .log(console.log)
      .put('/api/v1/namespaces/foobar/actions/test-package/simple-project?overwrite=true')
      .reply(201, {
        namespace: process.env.WSK_NAMESPACE,
      });

    process.chdir(testRoot); // need to change .cwd() for yargs to pickup `wsk` in package.json
    const builder = new CLI()
      .prepare([
        '--verbose',
        '--deploy',
        '--directory', testRoot,
      ]);
    builder.cfg._logger = new TestLogger();

    const res = await builder.run();
    assert.deepEqual(res, {
      wsk: {
        name: 'openwhisk;host=https://example.com',
        url: '/foobar/default/simple-project',
      },
    });

    const out = builder.cfg.log.output;
    assert.ok(out.indexOf('$ wsk action invoke -r /foobar/test-package/simple-project') > 0);
  });
});
