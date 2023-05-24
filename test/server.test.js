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
import assert from 'assert';
import { resolve } from 'path';
import { fetch, Response } from '@adobe/fetch';

import DevelopmentServer from '../src/DevelopmentServer.js';

describe('Server Test', () => {
  let envCopy;

  beforeEach(() => {
    envCopy = { ...process.env };
  });

  afterEach(() => {
    process.env = envCopy;
  });

  it('it can start an stop the server', async () => {
    const main = (req, ctx) => {
      const body = {};
      Object.entries(ctx.env).forEach(([key, value]) => {
        if (key.startsWith('TEST_') && key.endsWith('_PARAM')) {
          body[key] = value;
        }
      });
      return new Response(JSON.stringify(body), {
        headers: {
          'content-type': 'application/json',
        },
      });
    };
    const server = new DevelopmentServer(main)
      .withPort(0)
      .withDirectory(resolve(__rootdir, 'test', 'fixtures', 'server-test'));
    await server.init();
    server.params.TEST_DIRECT_PARAM = 'foo-direct-param';
    await server.start();

    const res = await fetch(`http://localhost:${server.server.address().port}/`);
    assert.deepStrictEqual(await res.json(), {
      TEST_DEFAULT_PARAM: 'dev-default',
      TEST_DEV_FILE_PARAM: 'foo-dev-file',
      TEST_DEV_PARAM: 'foo-dev-param',
      TEST_DIRECT_PARAM: 'foo-direct-param',
      TEST_FILE_PARAM: 'foo-file',
      TEST_PACKAGE_FILE_PARAM: 'foo-package-file',
      TEST_PACKAGE_PARAM: 'foo-package-param',
      TEST_PARAM: 'foo-param',
    });
    await server.stop();
  });

  it('it can start set the xfh header', async () => {
    const main = (req) => new Response(`hello: ${req.headers.get('x-forwarded-host')}`);
    const server = new DevelopmentServer(main)
      .withPort(0)
      .withXFH('localhost:{port}');
    await server.init();
    server.params.TEST_PARAM = 'foo';
    await server.start();

    const res = await fetch(`http://localhost:${server.server.address().port}/`);
    assert.strictEqual(await res.text(), `hello: localhost:${server.server.address().port}`);
    await server.stop();
  });

  it('it can post json body', async () => {
    const main = async (req) => {
      const body = await req.json();
      return new Response(`hello: ${JSON.stringify(body)}`);
    };
    const server = new DevelopmentServer(main).withPort(0);
    await server.init();
    await server.start();

    const res = await fetch(`http://localhost:${server.server.address().port}/`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: { myparam: 'test' },
    });

    assert.strictEqual(await res.text(), 'hello: {"myparam":"test"}');
    await server.stop();
  });

  it('it can see the request method', async () => {
    // eslint-disable-next-line arrow-body-style
    const main = async (req) => {
      return new Response(`method: ${req.method}`);
    };

    const server = new DevelopmentServer(main).withPort(0);
    await server.init();
    await server.start();

    const res = await fetch(`http://localhost:${server.server.address().port}/`, {
      method: 'OPTIONS',
    });
    assert.strictEqual(await res.text(), 'method: OPTIONS');
    await server.stop();
  });

  it('it can see the query string', async () => {
    // eslint-disable-next-line arrow-body-style
    const main = async (req) => {
      return new Response(`qs: ${new URL(req.url).searchParams}`);
    };

    const server = new DevelopmentServer(main).withPort(0);
    await server.init();
    await server.start();

    const res = await fetch(`http://localhost:${server.server.address().port}/?a=1&b=2`);
    assert.strictEqual(await res.text(), 'qs: a=1&b=2');
    await server.stop();
  });

  it('resolves the action correctly', async () => {
    const main = async (req, ctx) => {
      const url = ctx.resolver.createURL({
        package: 'helix-services',
        name: 'content-proxy',
        version: 'v2',
      });
      return new Response(`xfh: ${url.href}`);
    };
    const server = new DevelopmentServer(main).withPort(0);
    await server.init();
    await server.start();

    const res = await fetch(`http://localhost:${server.server.address().port}/`);
    assert.strictEqual(await res.text(), 'xfh: https://localhost/helix-services/content-proxy/v2');
    await server.stop();
  });
});
