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

describe('Adapter tests for Azure', () => {
  it('context.pathInfo.suffix', async () => {
    const azure = proxyquire('../src/template/index.js', {
      './main.js': {
        main: (request, context) => {
          assert.equal(context.env.FOO, 'bar');
          assert.equal(context.pathInfo.suffix, '/foo');
          assert.ok(request);
          return new Response('okay');
        },
      },
      './params.json': {
        FOO: 'bar',
      },
    });

    const context = {
      // eslint-disable-next-line no-console
      log: console.log,
      executionContext: {
        functionName: 'simple-package--simple-name_1_45_0',
      },
    };
    const request = {
      url: 'https://deploy-helix.azurewebsites.net/api/simple-package/simple-name/1.45.0/foo',
      headers: {},
    };

    await azure(context, request);
    assert.equal(context.res.status, 200, context.res.body);
  });

  it('handles illegal request headers with 400', async () => {
    const azure = proxyquire('../src/template/index.js', {
      './main.js': {
        main: () => new Response('ok'),
      },
      './params.json': {
        FOO: 'bar',
      },
    });

    const context = {
      // eslint-disable-next-line no-console
      log: console.log,
      executionContext: {
        functionName: 'simple-package--simple-name_1_45_0',
      },
    };
    const request = {
      url: 'https://deploy-helix.azurewebsites.net/api/simple-package/simple-name/1.45.0/foo',
      headers: {
        accept: 'жsome value',
      },
    };

    await azure(context, request);
    assert.equal(context.res.status, 400, context.res.body);
  });

  it('set correct context and environment', async () => {
    process.env.WEBSITE_SITE_NAME = 'helix-pages';
    const azure = proxyquire('../src/template/index.js', {
      './main.js': {
        main: (req, context) => {
          const ret = JSON.stringify({
            func: context.func,
            invocation: context.invocation,
            env: Object.fromEntries(
              Object.entries(process.env)
                .filter(([key]) => key.startsWith('HELIX_UNIVERSAL')),
            ),
          });
          return new Response(ret);
        },
      },
      './params.json': {
        FOO: 'bar',
      },
    });

    const context = {
      // eslint-disable-next-line no-console
      log: console.log,
      executionContext: {
        functionName: 'simple-package--simple-name_1_45_0',
      },
    };
    const request = {
      url: 'https://deploy-helix.azurewebsites.net/api/simple-package/simple-name/1.45.0/foo',
      headers: {
        host: 'deploy-helix.azurewebsites.net',
        'x-transaction-id': 'my-tx-id',
        'x-request-id': 'my-request-id',
      },
    };

    await azure(context, request);
    const body = JSON.parse(context.res.body);
    assert.deepEqual(body, {
      env: {
        HELIX_UNIVERSAL_APP: 'helix-pages',
        HELIX_UNIVERSAL_NAME: 'simple-name',
        HELIX_UNIVERSAL_PACKAGE: 'simple-package',
        HELIX_UNIVERSAL_RUNTIME: 'azure-functions',
        HELIX_UNIVERSAL_VERSION: '1.45.0',
      },
      func: {
        app: 'helix-pages',
        fqn: 'simple-package--simple-name_1_45_0',
        name: 'simple-name',
        package: 'simple-package',
        version: '1.45.0',
      },
      invocation: {
        requestId: 'my-request-id',
        transactionId: 'my-tx-id',
      },
    });
  });
});
