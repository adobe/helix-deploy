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
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

let epsagonified = 0;

const wrapperStub = sinon.stub().callsFake((action) => (...args) => {
  epsagonified += 1;
  return action(...args);
});

const actionStatusStub = sinon.stub().callsFake((action) => (...args) => action(...args));

const epsagonInitStub = sinon.stub().callsFake(() => {});

describe('Epsagon tests for OpenWhisk', () => {
  beforeEach(() => {
    wrapperStub.resetHistory();
    actionStatusStub.resetHistory();
    epsagonInitStub.resetHistory();
  });

  it('instruments epsagon', async () => {
    const expected = epsagonified + 1;
    const { main } = proxyquire('../src/template/index.js', {
      './main.js': {
        main: () => new Response('ok'),
      },
      epsagon: {
        openWhiskWrapper: wrapperStub,
        lambdaWrapper: wrapperStub,
        init: epsagonInitStub,
        '@global': true,
      },
    });

    const params = {
      EPSAGON_TOKEN: 'foobar',
    };

    const result = await main(params);
    assert.equal(result.statusCode, 200);
    assert.equal(epsagonified, expected, 'epsagon should be instrumented');
  });

  it('does not instrument epsagon for status pings', async () => {
    const expected = epsagonified;
    const { main } = proxyquire('../src/template/index.js', {
      './main.js': {
        main: () => new Response('ok'),
      },
      epsagon: {
        openWhiskWrapper: wrapperStub,
        lambdaWrapper: wrapperStub,
        init: epsagonInitStub,
        '@global': true,
      },
    });

    const params = {
      EPSAGON_TOKEN: 'foobar',
      __ow_path: '/_status_check/healthcheck.json',
    };

    const result = await main(params);
    assert.equal(result.statusCode, 200);
    assert.equal(epsagonified, expected, 'epsagon should be not instrumented');
  });
});

describe('Epsagon tests for AWS', () => {
  beforeEach(() => {
    wrapperStub.resetHistory();
    actionStatusStub.resetHistory();
    epsagonInitStub.resetHistory();
    process.env.AWS_LAMBDA_FUNCTION_NAME = 'foobar';
  });

  afterEach(() => {
    delete process.env.AWS_LAMBDA_FUNCTION_NAME;
  });

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
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:118435662149:function:dump:4_3_1',
    awsRequestId: '535f0399-9c90-4042-880e-620cfec6af55',
  };

  it('instruments epsagon', async () => {
    const expected = epsagonified + 1;
    const { lambda } = proxyquire('../src/template/index.js', {
      './main.js': {
        main: () => new Response('ok'),
      },
      './aws-package-params.js': () => ({
        EPSAGON_TOKEN: 'foobar',
      }),
      epsagon: {
        openWhiskWrapper: wrapperStub,
        lambdaWrapper: wrapperStub,
        init: epsagonInitStub,
        '@global': true,
      },
    });

    const res = await lambda(DEFAULT_EVENT, DEFAULT_CONTEXT);
    assert.equal(res.statusCode, 200);
    assert.equal(epsagonified, expected, 'epsagon should be instrumented');
  });

  it('does not instrument epsagon for status pings', async () => {
    const expected = epsagonified;
    const { lambda } = proxyquire('../src/template/index.js', {
      './main.js': {
        main: () => new Response('ok'),
      },
      './aws-package-params.js': () => ({
        EPSAGON_TOKEN: 'foobar',
      }),
      epsagon: {
        openWhiskWrapper: wrapperStub,
        lambdaWrapper: wrapperStub,
        init: epsagonInitStub,
        '@global': true,
      },
    });

    const res = await lambda({
      ...DEFAULT_EVENT,
      pathParameters: {
        path: '_status_check/healthcheck.json',
      },
    }, DEFAULT_CONTEXT);
    assert.equal(res.statusCode, 200);
    assert.equal(epsagonified, expected, 'epsagon should not be instrumented');
  });
});
