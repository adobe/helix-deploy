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

import { resolve } from 'path';
import chai from 'chai';
import chaiHttp from 'chai-http';
import { Response } from '@adobe/helix-fetch';

import DevelopmentServer from '../src/DevelopmentServer.js';

chai.use(chaiHttp);

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

    const res = await chai.request(`http://localhost:${server.server.address().port}`)
      .get('/');
    chai.expect(res.body).to.be.eql({
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

    const res = await chai.request(`http://localhost:${server.server.address().port}`)
      .get('/');
    chai.expect(res.text).to.be.equal(`hello: localhost:${server.server.address().port}`);
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

    const res = await chai.request(`http://localhost:${server.server.address().port}`)
      .post('/')
      .set('content-type', 'application/json')
      .send({ myparam: 'test' });

    chai.expect(res.text).to.be.equal('hello: {"myparam":"test"}');
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

    const res = await chai.request(`http://localhost:${server.server.address().port}`)
      .get('/');

    chai.expect(res.text).to.be.equal('xfh: https://helix-pages.anywhere.run/helix-services/content-proxy@v2');
    await server.stop();
  });
});
