/*
 * Copyright 2019 Adobe. All rights reserved.
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

const CLI = require('../src/cli.js');

describe('CLI Test', () => {
  it('has correct defaults with no arguments', () => {
    const builder = new CLI().prepare();
    assert.equal(builder._verbose, false);
    assert.equal(builder._deploy, false);
    assert.equal(builder._build, true);
    assert.equal(builder._test, undefined);
    assert.equal(builder._showHints, true);
    assert.equal(builder._kind, 'nodejs:10');
    assert.equal(builder._docker, null);
    assert.deepEqual(builder._modules, []);
    assert.equal(JSON.stringify([...builder._statics]).toString(), '[]');
    assert.deepEqual(builder._params, {});
    assert.equal(builder._webAction, true);
    assert.equal(builder._rawHttp, false);
    assert.equal(builder._updatePackage, false);
    assert.equal(builder._packageShared, false);
  });

  it('sets verbose flag', () => {
    const builder = new CLI()
      .prepare(['-v']);
    assert.equal(builder._verbose, true);
  });

  it('sets directory argument', () => {
    const builder = new CLI()
      .prepare(['--directory', 'foo']);
    assert.equal(builder._cwd, 'foo');
  });

  it('sets deploy flag', () => {
    const builder = new CLI()
      .prepare(['--deploy']);
    assert.equal(builder._deploy, true);
  });

  it('clears build flag', () => {
    const builder = new CLI()
      .prepare(['--no-build']);
    assert.equal(builder._build, false);
  });

  it('sets test flag', () => {
    const builder = new CLI()
      .prepare(['--test']);
    assert.equal(builder._test, '');
  });

  it('sets test url', () => {
    const builder = new CLI()
      .prepare(['--test', '/ping']);
    assert.equal(builder._test, '/ping');
  });

  it('sets name', () => {
    const builder = new CLI()
      .prepare(['--name', 'foo']);
    assert.equal(builder._name, 'foo');
  });

  it('sets version', () => {
    const builder = new CLI()
      .prepare(['--pkgVersion', '1.2.3']);
    assert.equal(builder._version, '1.2.3');
  });

  it('sets kind', () => {
    const builder = new CLI()
      .prepare(['--kind', 'foo']);
    assert.equal(builder._kind, 'foo');
  });

  it('sets docker', () => {
    const builder = new CLI()
      .prepare(['--docker', 'foo']);
    assert.equal(builder._docker, 'foo');
  });

  it('sets hints', () => {
    const builder = new CLI()
      .prepare(['--no-hints']);
    assert.equal(builder._showHints, false);
  });

  it('sets links', () => {
    const builder = new CLI()
      .prepare(['--version-link', 'latest', '-l', 'major']);
    assert.deepEqual(builder._links, ['latest', 'major']);
  });

  it('sets disable web-action', () => {
    const builder = new CLI()
      .prepare(['--no-web-export']);
    assert.equal(builder._webAction, false);
  });

  it('sets enable raw-http', () => {
    const builder = new CLI()
      .prepare(['--raw-http']);
    assert.equal(builder._webAction, true);
    assert.equal(builder._rawHttp, true);
  });

  it('raw http and disable webaction fails', async () => {
    try {
      await new CLI()
        .prepare(['--raw-http', '--no-web-export'])
        .validate();
      assert.fail('should fail.');
    } catch (e) {
      assert.equal(e.toString(), 'Error: raw-http requires web-export');
    }
  });

  it('can add statics', () => {
    const builder = new CLI()
      .prepare(['-s', 'foo', '-s', 'bar']);
    assert.equal(JSON.stringify([...builder._statics]).toString(), '[["foo","foo"],["bar","bar"]]');
  });

  it('can add params', () => {
    const builder = new CLI()
      .prepare(['-p', 'foo=bar']);
    assert.deepEqual(builder._params, { foo: 'bar' });
  });

  it('can add modules', () => {
    const builder = new CLI()
      .prepare(['-m', 'foo', '-m', 'bar']);
    assert.deepEqual(builder._modules, ['foo', 'bar']);
  });

  it('can add externals with regexp', () => {
    const builder = new CLI()
      .prepare(['--externals', '/.*/']);
    assert.deepEqual(builder._externals, [/.*/]);
  });

  it('can add params from json file', () => {
    const file = path.resolve(__dirname, 'fixtures/test-params.json');
    const builder = new CLI()
      .prepare(['-f', file]);
    assert.deepEqual(builder._params, {
      bar: 'Hello, world.',
      foo: 42,
    });
  });

  it('can add params from env file', () => {
    const file = path.resolve(__dirname, 'fixtures/test-params.env');
    const builder = new CLI()
      .prepare(['-f', file]);
    assert.deepEqual(builder._params, {
      bar: 'Hello, world.',
      foo: 42,
    });
  });

  it('can add params from env file with references', async () => {
    const file = path.resolve(__dirname, 'fixtures/test-params-file.env');
    const builder = new CLI()
      .prepare(['-f', file]);
    await builder.validate();
    assert.deepEqual(builder._params, {
      bar: 'Hello, world.',
      foo: '42',
      key: 'my test key!\n',
      nofile: '@foo@',
    });
  });

  it('can add package params from json file', () => {
    const file = path.resolve(__dirname, 'fixtures/test-params.json');
    const builder = new CLI()
      .prepare(['--package.params-file', file]);
    assert.deepEqual(builder._packageParams, {
      bar: 'Hello, world.',
      foo: 42,
    });
  });

  it('can add package params from env file', () => {
    const file = path.resolve(__dirname, 'fixtures/test-params.env');
    const builder = new CLI()
      .prepare(['--package.params-file', file]);
    assert.deepEqual(builder._packageParams, {
      bar: 'Hello, world.',
      foo: 42,
    });
  });

  it('can add params from env file with references', async () => {
    const file = path.resolve(__dirname, 'fixtures/test-params-file.env');
    const builder = new CLI()
      .prepare(['--package.params-file', file]);
    await builder.validate();
    assert.deepEqual(builder._packageParams, {
      bar: 'Hello, world.',
      foo: '42',
      key: 'my test key!\n',
      nofile: '@foo@',
    });
  });

  it('sets update-package', () => {
    const builder = new CLI()
      .prepare(['--update-package']);
    assert.equal(builder._updatePackage, true);
  });

  it('sets package name', () => {
    const builder = new CLI()
      .prepare(['--package.name', 'foo']);
    assert.equal(builder._packageName, 'foo');
  });

  it('gets package via action name', async () => {
    const builder = new CLI()
      .prepare(['--name', 'foo/bar']);
    await builder.validate();
    assert.equal(builder._name, 'foo/bar');
    assert.equal(builder._packageName, 'foo');
  });

  it('sets package shared flag', () => {
    const builder = new CLI()
      .prepare(['--package.shared']);
    assert.equal(builder._packageShared, true);
  });
});
