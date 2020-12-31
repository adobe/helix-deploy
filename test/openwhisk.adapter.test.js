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
const proxyquire = require('proxyquire');

describe('OpenWhisk Adapter Test', () => {
  beforeEach(() => {
    process.env.__OW_ACTION_NAME = '/simple-package/simple-name';
    process.env.__OW_ACTIVATION_ID = '1234';
    process.env.__OW_API_HOST = 'https://test.com';
  });

  it('Adapts with empty params', async () => {
    const { main } = proxyquire('../src/template/index.js', {
      './main.js': {
        main: () => new Response(),
        '@noCallThru': true,
      },
    });

    const resp = await main({});
    assert.deepEqual(resp, {
      body: '',
      headers: {},
      statusCode: 200,
    });
  });

  it('Propagates query', async () => {
    const { main } = proxyquire('../src/template/index.js', {
      './main.js': {
        main: (req) => {
          const ret = JSON.stringify({
            url: req.url,
          });
          return new Response(ret);
        },
        '@noCallThru': true,
      },
    });

    const resp = await main({
      __ow_query: 'foo=bar&zoo=42',
    });
    resp.body = JSON.parse(resp.body);
    assert.deepEqual(resp, {
      body: {
        url: 'https://test.com/api/v1/web/simple-package/simple-name?foo=bar&zoo=42',
      },
      headers: {
        'content-type': 'text/plain;charset=UTF-8',
      },
      statusCode: 200,
    });
  });

  it('Propagates query and params and populates env', async () => {
    const { main } = proxyquire('../src/template/index.js', {
      './main.js': {
        main: (req, context) => {
          const ret = JSON.stringify({
            url: req.url,
            secret: context.env.SECRET_TOKEN,
          });
          return new Response(ret);
        },
        '@noCallThru': true,
      },
    });

    const resp = await main({
      test: 'dummy',
      __ow_query: 'foo=bar&zoo=42',
      SECRET_TOKEN: 'xyz',
    });
    resp.body = JSON.parse(resp.body);
    assert.deepEqual(resp, {
      body: {
        url: 'https://test.com/api/v1/web/simple-package/simple-name?foo=bar&zoo=42&test=dummy',
        secret: 'xyz',
      },
      headers: {
        'content-type': 'text/plain;charset=UTF-8',
      },
      statusCode: 200,
    });
  });

  it('Respects path, headers and method', async () => {
    const { main } = proxyquire('../src/template/index.js', {
      './main.js': {
        main: (req, context) => {
          const ret = JSON.stringify({
            url: req.url,
            secret: context.env.SECRET_TOKEN,
            method: req.method,
            headers: req.headers.raw(),
          });
          return new Response(ret);
        },
        '@noCallThru': true,
      },
    });

    const resp = await main({
      test: 'dummy',
      __ow_query: 'foo=bar&zoo=42',
      __ow_path: '/test-suffix',
      __ow_headers: {
        'x-test-header': 42,
      },
      __ow_method: 'PUT',
      SECRET_TOKEN: 'xyz',
    });
    resp.body = JSON.parse(resp.body);
    assert.deepEqual(resp, {
      body: {
        headers: {
          'x-test-header': [
            '42',
          ],
        },
        method: 'PUT',
        secret: 'xyz',
        url: 'https://test.com/api/v1/web/simple-package/simple-name/test-suffix?foo=bar&zoo=42&test=dummy',
      },
      headers: {
        'content-type': 'text/plain;charset=UTF-8',
        'x-last-activation-id': '1234',
      },
      statusCode: 200,
    });
  });

  it('populates body', async () => {
    const { main } = proxyquire('../src/template/index.js', {
      './main.js': {
        main: async (req) => {
          const ret = JSON.stringify({
            body: await req.text(),
          });
          return new Response(ret);
        },
        '@noCallThru': true,
      },
    });

    const resp = await main({
      test: 'dummy',
      __ow_body: 'hello, world.',
      __ow_method: 'PUT',
      __ow_headers: {
        'content-type': 'text/plain',
      },
    });
    resp.body = JSON.parse(resp.body);
    assert.deepEqual(resp, {
      body: {
        body: 'hello, world.',
      },
      headers: {
        'content-type': 'text/plain;charset=UTF-8',
        'x-last-activation-id': '1234',
      },
      statusCode: 200,
    });
  });

  it('populates binary body', async () => {
    const { main } = proxyquire('../src/template/index.js', {
      './main.js': {
        main: async (req) => {
          const ret = JSON.stringify({
            body: await req.text(),
          });
          return new Response(ret);
        },
        '@noCallThru': true,
      },
    });

    const resp = await main({
      test: 'dummy',
      __ow_body: Buffer.from('hello, world.').toString('base64'),
      __ow_method: 'PUT',
      __ow_headers: {
        'content-type': 'application/octet-stream',
      },
    });
    resp.body = JSON.parse(resp.body);
    assert.deepEqual(resp, {
      body: {
        body: 'hello, world.',
      },
      headers: {
        'content-type': 'text/plain;charset=UTF-8',
        'x-last-activation-id': '1234',
      },
      statusCode: 200,
    });
  });

  it('uses localhost if no env var', async () => {
    delete process.env.__OW_API_HOST;
    const { main } = proxyquire('../src/template/index.js', {
      './main.js': {
        main: (req) => {
          const ret = JSON.stringify({
            url: req.url,
          });
          return new Response(ret);
        },
        '@noCallThru': true,
      },
    });

    const resp = await main({});
    resp.body = JSON.parse(resp.body);
    assert.deepEqual(resp, {
      body: {
        url: 'https://localhost/api/v1/web/simple-package/simple-name',
      },
      headers: {
        'content-type': 'text/plain;charset=UTF-8',
      },
      statusCode: 200,
    });
  });

  it('respects x-forwarded-host', async () => {
    const { main } = proxyquire('../src/template/index.js', {
      './main.js': {
        main: (req) => {
          const ret = JSON.stringify({
            url: req.url,
          });
          return new Response(ret);
        },
        '@noCallThru': true,
      },
    });

    const resp = await main({
      __ow_headers: {
        'x-forwarded-host': 'adobeioruntime.net,test.com',
      },
    });
    resp.body = JSON.parse(resp.body);
    assert.deepEqual(resp, {
      body: {
        url: 'https://adobeioruntime.net/api/v1/web/simple-package/simple-name',
      },
      headers: {
        'content-type': 'text/plain;charset=UTF-8',
      },
      statusCode: 200,
    });
  });

  it('responds with 500 on error', async () => {
    const { main } = proxyquire('../src/template/index.js', {
      './main.js': {
        main: () => {
          throw Error('boing!');
        },
        '@noCallThru': true,
      },
    });

    const resp = await main({
      __ow_headers: {
        'x-forwarded-host': 'adobeioruntime.net,test.com',
      },
    });
    assert.deepEqual(resp, {
      body: 'Internal Server Error',
      headers: {
        'Content-Type': 'text/plain',
      },
      statusCode: 500,
    });
  });
});
