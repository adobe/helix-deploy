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
});
