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
/* global Dictionary */

async function handler(event) {
  try {
    const { request } = event;
    console.log('Fastly Adapter is here');
    let packageParams;
    // eslint-disable-next-line import/no-unresolved,global-require
    const { main } = require('./main.js');
    const context = {
      resolver: null,
      pathInfo: {
        suffix: request.url.replace(/\?.*/, ''),
      },
      runtime: {
        name: 'compute-at-edge',
        // region: request.cf.colo,
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
      env: new Proxy(new Dictionary('secrets'), {
        get: (target, prop) => {
          try {
            return target.get(prop);
          } catch {
            if (packageParams) {
              console.log('Using cached params');
              return packageParams[prop];
            }
            const url = target.get('_package');
            const token = target.get('_token');
            // console.log(`Getting secrets from ${url} with ${token}`);
            return fetch(url, {
              backend: 'gateway',
              headers: {
                authorization: `Bearer ${token}`,
              },
            }).then((response) => {
              if (response.ok) {
                // console.log('response is ok...');
                return response.text().then((json) => {
                  // console.log('json received: ' + json);
                  packageParams = JSON.parse(json);
                  return packageParams[prop];
                }).catch((error) => {
                  console.error(`Unable to parse JSON: ${error.message}`);
                });
              }
              console.error(`HTTP status is not ok: ${response.status}`);
              return undefined;
            }).catch((err) => {
              console.error(`Unable to fetch parames: ${err.message}`);
            });
          }
        },
      }),
      storage: null,
    };
    const response = await main(request, context);
    return response;
  } catch (e) {
    console.log(e.message);
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
}

function fastly() {
  console.log('checking for fastly environment');
  /* eslint-disable-next-line no-undef */
  if (CacheOverride) {
    return handler;
  }
  return false;
}

module.exports = fastly;
