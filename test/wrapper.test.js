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

describe('Wrapper tests for Azure', () => {
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
});

describe('Wrapper tests for OpenWhisk', () => {
  it('text request body is decoded', async () => {
    const { main } = proxyquire('../src/template/index.js', {
      './main.js': {
        // eslint-disable-next-line no-unused-vars
        main: async (request, context) => {
          assert.equal(await request.text(), 'hallo text');
          return new Response('okay');
        },
      },
    });

    const params = {
      __ow_body: 'hallo text',
      __ow_method: 'post',
      __ow_headers: {
        'content-type': 'text/plain',
      },
    };

    const result = await main(params);
    assert.equal(result.statusCode, 200);
  });

  it('json request body is decoded', async () => {
    const { main } = proxyquire('../src/template/index.js', {
      './main.js': {
        // eslint-disable-next-line no-unused-vars
        main: async (request, context) => {
          assert.deepEqual(await request.json(), { goo: 'haha' });
          return new Response('okay');
        },
      },
    });

    const params = {
      __ow_body: 'eyJnb28iOiJoYWhhIn0=',
      __ow_method: 'post',
      __ow_headers: {
        'content-type': 'application/json',
      },
    };

    const result = await main(params);
    assert.equal(result.statusCode, 200);
  });

  it('handles illegal request headers with 400', async () => {
    const { main } = proxyquire('../src/template/index.js', {
      './main.js': {
        main: () => new Response('ok'),
      },
    });
    const params = {
      __ow_method: 'get',
      __ow_headers: {
        accept: 'жsome value',
      },
    };
    const result = await main(params);
    assert.equal(result.statusCode, 400);
  });
});

describe('Wrapper tests for AWS', () => {
  const DEFAULT_EVENT = {
    version: '2.0',
    routeKey: 'ANY /dump',
    rawPath: '/dump',
    rawQueryString: '',
    headers: {
      accept: '*/*',
      'content-length': '0',
      host: 'kvvyh7ikcb.execute-api.us-east-1.amazonaws.com',
      'user-agent': 'curl/7.64.1',
      'x-amzn-trace-id': 'Root=1-603df0bb-05e846307a6221f72030fe68',
      'x-forwarded-for': '210.153.232.90',
      'x-forwarded-port': '443',
      'x-forwarded-proto': 'https',
    },
    requestContext: {
      accountId: '118435662149',
      apiId: 'kvvyh7ikcb',
      domainName: 'kvvyh7ikcb.execute-api.us-east-1.amazonaws.com',
      domainPrefix: 'kvvyh7ikcb',
      http: {
        method: 'GET',
        path: '/dump',
        protocol: 'HTTP/1.1',
        sourceIp: '210.153.232.90',
        userAgent: 'curl/7.64.1',
      },
      requestId: 'bjKNYhHcoAMEJIw=',
      routeKey: 'ANY /dump',
      stage: '$default',
      time: '02/Mar/2021:08:00:59 +0000',
      timeEpoch: 1614672059918,
    },
    isBase64Encoded: false,
  };

  const DEFAULT_CONTEXT = {
    getRemainingTimeInMillis: () => 30000,
    callbackWaitsForEmptyEventLoop: true,
    functionVersion: '$LATEST',
    functionName: 'dump',
    memoryLimitInMB: '128',
    logGroupName: '/aws/lambda/dump',
    logStreamName: '2021/03/02/[$LATEST]89b58159f93949f787eb8de043937bbb',
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:118435662149:function:helix-pages--dump:4_3_1',
    awsRequestId: '535f0399-9c90-4042-880e-620cfec6af55',
  };

  it('context.func', async () => {
    const { lambda } = proxyquire('../src/template/index.js', {
      './main.js': {
        main: (request, context) => {
          assert.deepEqual(context.func, {
            name: 'dump',
            package: 'helix-pages',
            version: '4.3.1',
            fqn: 'arn:aws:lambda:us-east-1:118435662149:function:helix-pages--dump:4_3_1',
            app: 'kvvyh7ikcb',
          });
          return new Response('ok');
        },
      },
      './aws-package-params.js': () => ({}),
    });
    const res = await lambda(DEFAULT_EVENT, DEFAULT_CONTEXT);
    assert.equal(res.statusCode, 200);
  });

  it('handles illegal request headers with 400', async () => {
    const { lambda } = proxyquire('../src/template/index.js', {
      './main.js': {
        main: () => new Response('ok'),
      },
      './aws-package-params.js': () => ({}),
    });
    const res = await lambda({
      ...DEFAULT_EVENT,
      headers: {
        host: 'kvvyh7ikcb.execute-api.us-east-1.amazonaws.com',
        accept: 'жsome value',
      },
    }, DEFAULT_CONTEXT);
    assert.equal(res.statusCode, 400);
  });
});

describe('Wrapper tests for Google', () => {
  it('handles illegal request headers with 400', async () => {
    const { google } = proxyquire('../src/template/index.js', {
      './main.js': {
        main: () => new Response('ok'),
      },
    });
    const req = {
      url: 'https://deploy-helix.azurewebsites.net/api/simple-package/simple-name/1.45.0/foo',
      headers: {
        accept: 'жsome value',
      },
    };
    const res = {
      code: 999,
      status(value) {
        this.code = value;
        return this;
      },
      send() {
      },
    };
    await google(req, res);
    assert.equal(res.code, 400);
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
            app: 'helix',
          });
          return new Response('ok');
        },
      },
      './google-package-params.js': () => ({}),
    });
    const req = {
      url: 'https://deploy-helix.azurewebsites.net/api/simple-package/simple-name/1.45.0/foo',
      headers: {
        host: 'us-east-helix.google.com',
      },
    };
    req.get = (key) => req.headers[key];
    const res = {
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
    await google(req, res);
    assert.equal(res.code, 200);
  });
});
