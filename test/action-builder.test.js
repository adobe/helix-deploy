/*
 * Copyright 2019 Adobe. All rights reserved.
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
/* eslint-disable no-underscore-dangle,no-template-curly-in-string */

import assert from 'assert';
import ActionBuilder from '../src/ActionBuilder.js';

describe('ActionBuilder Test', () => {
  it('substitute replaces single string', async () => {
    assert.equal(ActionBuilder.substitute('test/${version}/foo', {
      version: '1.2.3',
    }), 'test/1.2.3/foo');
  });

  it('substitute replaces multiple string', async () => {
    assert.equal(ActionBuilder.substitute('${name}/${version}/foo', {
      version: '1.2.3',
      name: 'bar',
    }), 'bar/1.2.3/foo');
  });

  it('substitute replaces string multiple times', async () => {
    assert.equal(ActionBuilder.substitute('${name}/${version}/${name}', {
      version: '1.2.3',
      name: 'bar',
    }), 'bar/1.2.3/bar');
  });
});
