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
/* eslint-env serviceworker */

async function handler(event) {
  console.log(event);
  const { request } = event;
  // eslint-disable-next-line import/no-unresolved,global-require
  const { main } = require('./main.js');
  const context = {
    resolver: null,
    pathInfo: {
      suffix: request.url.replace(/\?.*/, ''),
    },
    runtime: {
      name: 'cloudflare-workers',
      region: request.cf.colo,
    },
    func: {
      name: null,
      package: null,
      version: null,
      fqn: null,
      app: null,
    },
    invocation: {
      id: null,
      deadline: null,
      transactionId: null,
      requestId: null,
    },
    env: {

    },
    storage: null,
  };
  const response = await main(request, context);
  return response;
}

function cloudflare() {
  if (caches.default) {
    return handler;
  }
  return false;
}

module.exports = cloudflare;
