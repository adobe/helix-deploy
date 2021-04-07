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
const { Response } = require('@adobe/helix-fetch');
const assert = require('assert');
const proxyquire = require('proxyquire').noCallThru();

function createMockResponse() {
  return {
    code: 999,
    status(value) {
      this.code = value;
      return this;
    },
    set() {
      return this;
    },
    send() {
      return this;
    },
  };
}

function createMockRequest(url, headers) {
  return {
    originalUrl: url.replace(/^\/([^/]+)/, ''),
    headers,
    get(key) {
      return this.headers[key];
    },
  };
}

describe('Adapter tests for Google', () => {
  it('handles illegal request headers with 400', async () => {
    const { google } = proxyquire('../src/template/index.js', {
      './main.js': {
        main: () => new Response('ok'),
      },
    });
    const req = createMockRequest('/api/simple-package/simple-name/1.45.0/foo', {
      accept: 'жsome value',
    });
    const res = createMockResponse();
    await google(req, res);
    assert.equal(res.code, 400);
  });

  it('context.pathInfo.suffix', async () => {
    process.env.K_SERVICE = 'helix-services--content-proxy';
    process.env.K_REVISION = '4.3.1';
    const { google } = proxyquire('../src/template/index.js', {
      './main.js': {
        main: (request, context) => {
          assert.equal(context.pathInfo.suffix, '/foo/bar');
          assert.ok(request);
          return new Response('okay');
        },
      },
      './google-package-params.js': () => ({}),
    });

    const req = createMockRequest('/helix-services--content-proxy_4.3.1/foo/bar', {
      host: 'us-central1-helix-225321.cloudfunctions.net',
    });
    const res = createMockResponse();
    await google(req, res);
    assert.equal(res.code, 200);
  });

  it('context.func', async () => {
    process.env.K_SERVICE = 'simple-package--simple-name';
    process.env.K_REVISION = '1.45.0';
    const { google } = proxyquire('../src/template/index.js', {
      './main.js': {
        main: (request, context) => {
          assert.deepEqual(context.func, {
            name: 'simple-name',
            package: 'simple-package',
            version: '1.45.0',
            fqn: 'simple-package--simple-name',
            app: 'helix-225321',
          });
          return new Response('ok');
        },
      },
      './google-package-params.js': () => ({}),
    });
    const req = createMockRequest('/api/simple-package/simple-name/1.45.0/foo', {
      host: 'us-central1-helix-225321.cloudfunctions.net',
    });
    const res = createMockResponse();
    await google(req, res);
    assert.equal(res.code, 200);
  });

  it('context.invocation', async () => {
    process.env.K_SERVICE = 'simple-package--simple-name';
    process.env.K_REVISION = '1.45.0';
    const { google } = proxyquire('../src/template/index.js', {
      './main.js': {
        main: (request, context) => {
          assert.deepEqual(context.invocation, {
            deadline: NaN,
            id: '1234',
            requestId: 'some-request-id',
            transactionId: 'my-tx-id',
          });
          return new Response('ok');
        },
      },
      './google-package-params.js': () => ({}),
    });
    const req = createMockRequest('/api/simple-package/simple-name/1.45.0/foo', {
      host: 'us-central1-helix-225321.cloudfunctions.net',
      'function-execution-id': '1234',
      'x-transaction-id': 'my-tx-id',
      'x-cloud-trace-context': 'some-request-id',
    });
    const res = createMockResponse();
    await google(req, res);
    assert.equal(res.code, 200);
  });
});
