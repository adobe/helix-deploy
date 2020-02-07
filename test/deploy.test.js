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
const crypto = require('crypto');
const path = require('path');
const fse = require('fs-extra');
const nock = require('nock');
const util = require('util');

const CLI = require('../src/cli.js');

const ANSI_REGEXP = RegExp([
  '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[a-zA-Z\\d]*)*)?\\u0007)',
  '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PRZcf-ntqry=><~]))',
].join('|'), 'g');

class TestLogger {
  constructor() {
    this.messages = [];
  }

  _log(level, ...args) {
    this.messages.push(util.format(...args).replace(ANSI_REGEXP, ''));
    // eslint-disable-next-line no-console
    console[level](...args);
  }

  get output() {
    return this.messages.join('\n');
  }

  debug(...args) {
    this._log('debug', ...args);
  }

  info(...args) {
    this._log('info', ...args);
  }

  warn(...args) {
    this._log('warn', ...args);
  }

  error(...args) {
    this._log('error', ...args);
  }
}

async function createTestRoot() {
  const dir = path.resolve(__dirname, 'tmp', crypto.randomBytes(16)
    .toString('hex'));
  await fse.ensureDir(dir);
  return dir;
}

// set fake wsk props
process.env.WSK_NAMESPACE = 'foobar';
process.env.WSK_APIHOST = 'https://example.com';
process.env.WSK_AUTH = 'fake-key';


describe('Deploy Test', () => {
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

  it('reports nice error if no wsk props are set', async () => {
    await fse.copy(path.resolve(__dirname, 'fixtures', 'web-action'), testRoot);
    process.chdir(testRoot); // need to change .cwd() for yargs to pickup `wsk` in package.json
    const builder = new CLI()
      .prepare([
        '--verbose',
        '--deploy',
        '--directory', testRoot,
      ]);
    // hack to invalidate the wsk props, if any
    builder.initWskProps = () => {};

    await assert.rejects(builder.run(), /Missing OpenWhisk credentials./);
  });

  it('reports error configured namespace does not match wsk namespace', async () => {
    await fse.copy(path.resolve(__dirname, 'fixtures', 'web-action'), testRoot);
    process.chdir(testRoot); // need to change .cwd() for yargs to pickup `wsk` in package.json
    const builder = new CLI()
      .prepare([
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
      });


    process.chdir(testRoot); // need to change .cwd() for yargs to pickup `wsk` in package.json
    const builder = new CLI()
      .prepare([
        '--verbose',
        '--deploy',
        '--directory', testRoot,
      ]);
    builder._logger = new TestLogger();

    const res = await builder.run();
    assert.deepEqual(res, {
      name: 'openwhisk;host=https://example.com',
      url: '/foobar/default/simple-project',
    });

    const out = builder._logger.output;
    assert.ok(out.indexOf('$ curl "https://example.com/api/v1/web/foobar/default/simple-project"') > 0);
  });

  it('deploys a web action with package', async () => {
    await fse.copy(path.resolve(__dirname, 'fixtures', 'web-action-with-package'), testRoot);

    nock(process.env.WSK_APIHOST)
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
    builder._logger = new TestLogger();

    const res = await builder.run();
    assert.deepEqual(res, {
      name: 'openwhisk;host=https://example.com',
      url: '/foobar/test-package/simple-project',
    });

    const out = builder._logger.output;
    assert.ok(out.indexOf('$ curl "https://example.com/api/v1/web/foobar/test-package/simple-project"') > 0);
  });

  it('deploys a pure action', async () => {
    await fse.copy(path.resolve(__dirname, 'fixtures', 'pure-action'), testRoot);

    nock(process.env.WSK_APIHOST)
      // .log(console.log)
      .put('/api/v1/namespaces/foobar/actions/simple-project?overwrite=true')
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
    builder._logger = new TestLogger();

    const res = await builder.run();
    assert.deepEqual(res, {
      name: 'openwhisk;host=https://example.com',
      url: '/foobar/default/simple-project',
    });

    const out = builder._logger.output;
    assert.ok(out.indexOf('$ wsk action invoke -r /foobar/default/simple-project') > 0);
  });

  it('deploys a pure action with package', async () => {
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
    builder._logger = new TestLogger();

    const res = await builder.run();
    assert.deepEqual(res, {
      name: 'openwhisk;host=https://example.com',
      url: '/foobar/test-package/simple-project',
    });

    const out = builder._logger.output;
    assert.ok(out.indexOf('$ wsk action invoke -r /foobar/test-package/simple-project') > 0);
  });
});
