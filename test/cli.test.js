/*
 * Copyright 2018 Adobe. All rights reserved.
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

const CLI = require('../src/cli.js');

describe('CLI Test', () => {
  it('has correct defaults with no arguments', () => {
    const builder = new CLI(true).run();
    assert.equal(builder._verbose, false);
    assert.equal(builder._deploy, false);
    assert.equal(builder._test, false);
    assert.equal(builder._showHints, true);
    assert.equal(JSON.stringify([...builder._statics]).toString(), '[]');
    assert.deepEqual(builder._params, {});
  });

  it('sets verbose flag', () => {
    const builder = new CLI(true)
      .run(['-v']);
    assert.equal(builder._verbose, true);
  });

  it('sets deploy flag', () => {
    const builder = new CLI(true)
      .run(['--deploy']);
    assert.equal(builder._deploy, true);
  });

  it('sets test flag', () => {
    const builder = new CLI(true)
      .run(['--test']);
    assert.equal(builder._test, true);
  });

  it('sets nameg', () => {
    const builder = new CLI(true)
      .run(['--name', 'foo']);
    assert.equal(builder._name, 'foo');
  });

  it('disables hints flag', () => {
    const builder = new CLI(true)
      .run(['--no-hints']);
    assert.equal(builder._showHints, false);
  });

  it('can add statics', () => {
    const builder = new CLI(true)
      .run(['-s', 'foo', '-s', 'bar']);
    assert.equal(JSON.stringify([...builder._statics]).toString(), '[["foo","foo"],["bar","bar"]]');
  });

  it('can add params', () => {
    const builder = new CLI(true)
      .run(['-p', 'foo=bar']);
    assert.deepEqual(builder._params, { foo: 'bar' });
  });
});
