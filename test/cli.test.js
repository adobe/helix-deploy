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
    assert.equal(builder._test, false);
    assert.equal(builder._showHints, true);
    assert.equal(builder._kind, 'nodejs:10-fat');
    assert.equal(builder._docker, null);
    assert.deepEqual(builder._modules, []);
    assert.equal(JSON.stringify([...builder._statics]).toString(), '[]');
    assert.deepEqual(builder._params, {});
  });

  it('sets verbose flag', () => {
    const builder = new CLI()
      .prepare(['-v']);
    assert.equal(builder._verbose, true);
  });

  it('sets deploy flag', () => {
    const builder = new CLI()
      .prepare(['--deploy']);
    assert.equal(builder._deploy, true);
  });

  it('sets test flag', () => {
    const builder = new CLI()
      .prepare(['--test']);
    assert.equal(builder._test, true);
  });

  it('sets name', () => {
    const builder = new CLI()
      .prepare(['--name', 'foo']);
    assert.equal(builder._name, 'foo');
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
});
