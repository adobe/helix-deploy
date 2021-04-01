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
/* eslint-disable no-console */
const assert = require('assert');

const FastlyGateway = require('../src/gateway/FastlyGateway.js', {});

const gateway = new FastlyGateway({
  log: {
    info: console.log,
  },
  packageName: 'simple-package',
  name: 'simple',
});

let ops = [];

// eslint-disable-next-line no-underscore-dangle
gateway._fastly = {
  bulkUpdateDictItems: (_, dict, ...operations) => {
    ops = operations;
    assert.equal(dict, 'aliases');
  },
  discard: () => true,
};

describe('Unit Tests for Fastly Gateway', () => {
  beforeEach(() => {
    ops = [];
  });

  it('Links a regular major, minor, latest sequence', async () => {
    await gateway.updateLinks(['major', 'minor', 'latest'], '1.45.0');
    assert.equal(ops.length, 3);
    assert.deepStrictEqual(ops[0], {
      item_key: '/simple-package/simple@v1',
      item_value: '@1.45.0',
      op: 'upsert',
    });
    assert.deepStrictEqual(ops[1], {
      item_key: '/simple-package/simple@v1.45',
      item_value: '@1.45.0',
      op: 'upsert',
    });
    assert.deepStrictEqual(ops[2], {
      item_key: '/simple-package/simple@latest',
      item_value: '@1.45.0',
      op: 'upsert',
    });
  });

  it('Links a regular ci sequence', async () => {
    await gateway.updateLinks(['ci'], 'ci999');
    assert.equal(ops.length, 1);
    assert.deepStrictEqual(ops[0], {
      item_key: '/simple-package/simple@ci',
      item_value: '@ci999',
      op: 'upsert',
    });
  });
});
