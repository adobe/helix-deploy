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
const { Response } = require('@adobe/fetch');
const reader = require('./helper/read.js');

// eslint-disable-next-line no-unused-vars
module.exports.main = function main(req, context) {
  if (req.url.endsWith('/fail')) {
    throw new Error('internal error');
  }
  const url = new URL(req.url);
  const chanceoffailure = parseInt(url.searchParams.get('chanceoffailure') || '0', 10);
  if (Math.random() * 100 < chanceoffailure) {
    return new Response(`${chanceoffailure}% of requests fail. This is one of the failures`, {
      status: 503,
    });
  }
  const resp = {
    url: req.url,
    file: reader(),
    error: context.env.ERROR,
  };

  const resolve = url.searchParams.get('resolve');
  if (resolve) {
    const rurl = context.resolver.createURL({
      name: resolve,
      version: 'v1',
    });

    // eslint-disable-next-line no-console
    console.log('resolved', rurl);

    resp.resolve = rurl.toString();
  }

  const checkpathinfo = url.searchParams.get('checkpathinfo');
  if (checkpathinfo) {
    resp.pathinfo = context.pathInfo;
  }

  const response = new Response(JSON.stringify(resp));
  response.headers.set('Surrogate-Key', 'simple');
  response.headers.set('Hey', context.env.HEY);
  response.headers.set('Foo', context.env.FOO);
  return response;
};
