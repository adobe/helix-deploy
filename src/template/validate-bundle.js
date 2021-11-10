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
async function run(bundlePath, opts) {
  const result = {
  };
  try {
    const bundle = await import(bundlePath);
    const main = bundle.default?.main;
    if (!main || typeof main !== 'function') {
      throw Error('Action has no main() function.');
    }
    if (opts.invoke) {
      result.response = await main({});
    }
    result.status = 'ok';
  } catch (e) {
    result.status = 'error';
    result.error = `${e.message}\n${e.stack}`;
  }
  process.send(JSON.stringify(result));
}

run(process.argv[2], JSON.parse(process.argv[3])).then(process.stdout).catch(process.stderr);
