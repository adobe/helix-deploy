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
async function run(bundlePath, cfg) {
  const result = {
    status: 'ok',
  };
  try {
    const bundle = await import(bundlePath);
    const lambda = bundle.default?.lambda;
    if (!lambda || typeof lambda !== 'function') {
      throw Error('Action has no lambda() function.');
    }
    const test = cfg.testBundle ?? cfg.test;
    if (test !== undefined) {
      const event = {
        headers: cfg.testHeaders || {},
        rawPath: `/${cfg.packageName}/${cfg.baseName}/${cfg.version}`,
        rawQueryString: '',
        pathParameters: {
          path: '',
        },
        requestContext: {
          domainName: 'localhost',
          http: {
            method: 'get',
          },
        },
      };
      const testUrl = String(test).startsWith('/') ? test : cfg.testUrl;
      if (testUrl) {
        const url = new URL(testUrl, 'https://localhost/');
        event.pathParameters.path = url.pathname.substring(1);
        event.rawPath += url.pathname;
        event.rawQueryString = url.searchParams.toString();
      }

      const fn = typeof lambda.raw === 'function' ? lambda.raw : lambda;
      result.response = await fn(event, {
        invokedFunctionArn: `arn:aws:lambda:us-east-1:123456789012:function:${cfg.packageName}--${cfg.baseName}:${cfg.version}`,
        getRemainingTimeInMillis: () => 60 * 1000,
      });
      if (cfg.verbose) {
        // eslint-disable-next-line no-console
        console.log(result.response);
      }
      if (result.response.statusCode !== 200) {
        result.status = 'error';
        result.error = result.response.statusCode;
      }
    }
  } catch (e) {
    result.status = 'error';
    result.error = `${e.message}\n${e.stack}`;
  }
  process.send(JSON.stringify(result));
}

run(process.argv[2], JSON.parse(process.argv[3])).then(process.stdout).catch(process.stderr);
