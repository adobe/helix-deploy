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

/**
 * Checks if the content type is binary.
 * @param {string} type - content type
 * @returns {boolean} {@code true} if content type is binary.
 */
function isBinary(type) {
  if (/text\/.*/.test(type)) {
    return false;
  }
  if (/.*\/javascript/.test(type)) {
    return false;
  }
  if (/.*\/.*json/.test(type)) {
    return false;
  }
  if (/.*\/.*xml/.test(type)) {
    return /svg/.test(type); // openwhisk treats SVG as binary
  }
  return true;
}

/**
 * Checks if the response content-type header contains an charset part.
 * If the type is text/html and has no charset part, it will be appended.
 * @param {Response} resp the response
 * @return {Response} the same response
 */
function ensureUTF8Charset(resp) {
  const type = resp.headers.get('content-type');
  if (type === 'text/html') {
    resp.headers.set('content-type', 'text/html; charset=UTF-8');
  }
  return resp;
}

module.exports = {
  isBinary,
  ensureUTF8Charset,
};
