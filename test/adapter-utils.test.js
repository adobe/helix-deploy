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
import { extractPathFromURL } from '../src/template/adapter-utils.js';

describe('Fastly Adapter Test', () => {
  it('extract path from URL', () => {
    const req = { url: 'https://www.adobe.com/path' };
    const suffix = extractPathFromURL(req);
    assert.equal(suffix, '/path');
  });

  it('URL is path', () => {
    const req = { url: '/path?abc' };
    const suffix = extractPathFromURL(req);
    assert.equal(suffix, '/path');
  });

  it('URL is path', () => {
    const req = { url: 'https://www.adobe.com/path/sub-path/sub-sub?query=parameter' };
    const suffix = extractPathFromURL(req);
    assert.equal(suffix, '/path/sub-path/sub-sub');
  });
});
