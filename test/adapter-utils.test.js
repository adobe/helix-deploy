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
const { Response } = require('node-fetch');
const { isBinary, ensureUTF8Charset } = require('../src/template/utils.js');

describe('Adapter Utils Tests: ensureUTF8Encoding', () => {
  it('ignores missing charset-type header', async () => {
    const resp = ensureUTF8Charset(new Response());
    assert.ok(!resp.headers.get('content-type'));
  });

  it('ignores missing charset in non text/html header', async () => {
    const resp = ensureUTF8Charset(new Response('', {
      headers: {
        'content-type': 'text/plain',
      },
    }));
    assert.equal(resp.headers.get('content-type'), 'text/plain');
  });

  it('adds missing charset to text/html header', async () => {
    const resp = ensureUTF8Charset(new Response('', {
      headers: {
        'content-type': 'text/html',
      },
    }));
    assert.equal(resp.headers.get('content-type'), 'text/html; charset=UTF-8');
  });

  it('does not change existing charset to text/html header', async () => {
    const resp = ensureUTF8Charset(new Response('', {
      headers: {
        'content-type': 'text/html; charset=ISO-8891',
      },
    }));
    assert.equal(resp.headers.get('content-type'), 'text/html; charset=ISO-8891');
  });
});

describe('Adapter Utils Tests: isBinary', () => {
  it('produces correct result', async () => {
    assert.ok(isBinary('application/octet-stream'));
    assert.ok(isBinary('image/png'));
    assert.ok(!isBinary('text/html'));
    assert.ok(!isBinary('application/javascript'));
    assert.ok(!isBinary('application/json'));
    assert.ok(!isBinary('text/xml'));
    assert.ok(isBinary('image/svg+xml'));
    assert.ok(isBinary('text/yaml'));
  });
});
