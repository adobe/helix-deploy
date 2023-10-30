/*
 * Copyright 2023 Adobe. All rights reserved.
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
import { getEnvInfo } from '../src/template/fastly-adapter.js';

describe('Fastly Adapter Test', () => {
  it('Captures the environment', () => {
    const headers = new Map();
    const req = { headers };
    const env = (envvar) => {
      switch (envvar) {
        case 'FASTLY_CUSTOMER_ID': return 'cust1';
        case 'FASTLY_POP': return 'fpop';
        case 'FASTLY_SERVICE_ID': return 'sid999';
        case 'FASTLY_SERVICE_VERSION': return '1234';
        case 'FASTLY_TRACE_ID': return 'trace-id';
        default: return undefined;
      }
    };

    const info = getEnvInfo(req, env);

    assert.equal(info.functionFQN, 'cust1-sid999-1234');
    assert.equal(info.functionName, 'sid999');
    assert.equal(info.region, 'fpop');
    assert.equal(info.requestId, 'trace-id');
    assert.equal(info.serviceVersion, '1234');
    assert.equal(info.txId, 'trace-id');
  });

  it('Takes the txid from the request headers', () => {
    const headers = new Map();
    headers.set('foo', 'bar');
    headers.set('x-transaction-id', 'tx7');
    const req = { headers };
    const env = (_) => 'something';

    const info = getEnvInfo(req, env);

    assert.equal(info.txId, 'tx7');
  });
});
