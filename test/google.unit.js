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
import assert from 'assert';
import testdata from './fixtures/google-allfns.js';
import GoogleDeployer from '../src/deploy/GoogleDeployer.js';

const { filterFunctions } = GoogleDeployer;

describe('Google Integration Tests', () => {
  it('Test function filter for no version', () => {
    const fns = filterFunctions(testdata, 'embed', new Date(1620308098065), { });
    assert.equal(fns.length, 0);
  });

  it('Test function filter for CI version', () => {
    const fns = filterFunctions(testdata, 'embed', new Date(1620308098065), { ciAge: 3600 * 24 });
    assert.equal(fns.length, 4);
  });

  it('Test function filter by count for CI version', () => {
    const fns = filterFunctions(testdata, 'embed', new Date(1620308098065), { ciNum: 3 });
    assert.equal(fns.length, 2);
  });

  it('Test function filter by count for CI version (keep all)', () => {
    const fns = filterFunctions(testdata, 'embed', new Date(1620308098065), { ciNum: 30 });
    assert.equal(fns.length, 0);
  });

  it('Test function filter for patch version', () => {
    const fns = filterFunctions(testdata, 'embed', new Date(1620308098065), { patchAge: 3600 * 24 * 21 }, { majorVersion: 1, minorVersion: 11, patchVersion: 8 });
    assert.equal(fns.length, 6);
  });

  it('Test function filter by count for patch version', () => {
    const fns = filterFunctions(testdata, 'embed', new Date(1620308098065), { patchNum: 2 }, { majorVersion: 1, minorVersion: 11, patchVersion: 8 });
    assert.equal(fns.length, 5);
  });

  it('Test function filter for minor version', () => {
    const fns = filterFunctions(testdata, 'dispatch', new Date(1620308098065), { minorAge: 3600 * 24 * 21 }, { majorVersion: 4, minorVersion: 12, patchVersion: 2 });
    assert.equal(fns.length, 9);
  });

  it('Test function filter by count for minor version', () => {
    const fns = filterFunctions(testdata, 'dispatch', new Date(1620308098065), { minorNum: 4 }, { majorVersion: 4, minorVersion: 12, patchVersion: 2 });
    assert.equal(fns.length, 6);
  });

  it('Test function filter for major version', () => {
    const fns = filterFunctions(testdata, 'cgi-bin-feed', new Date(1620308098065), { majorAge: 3600 * 24 * 7 }, { majorVersion: 6, minorVersion: 0, patchVersion: 0 });
    assert.equal(fns.length, 15);
  });

  it('Test function filter by count for major version', () => {
    const fns = filterFunctions(testdata, 'cgi-bin-feed', new Date(1620308098065), { majorNum: 2 }, { majorVersion: 6, minorVersion: 0, patchVersion: 0 });
    assert.equal(fns.length, 14);
  });

  it('Test function filter for major, minor, patch, ci version', () => {
    const fns = filterFunctions(testdata, 'cgi-bin-feed', new Date(1620308098065), {
      majorAge: 3600 * 24 * 7, minorAge: 3600 * 24 * 5, patchAge: 3600 * 24 * 3, ciAge: 3600 * 24,
    }, { majorVersion: 6, minorVersion: 0, patchVersion: 0 });
    assert.equal(fns.length, 37);
  });
});
