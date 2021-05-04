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

const chai = require('chai');
const chaiHttp = require('chai-http');
const { Response } = require('@adobe/helix-fetch');

chai.use(chaiHttp);

const DevelopmentServer = require('../src/DevelopmentServer.js');

describe('Server Test', () => {
  it('it can start an stop the server', async () => {
    const main = (req, ctx) => new Response(`hello: ${ctx.env.TEST_PARAM}`);
    const server = new DevelopmentServer(main).withPort(0);
    await server.init();
    server.params.TEST_PARAM = 'foo';
    await server.start();

    const res = await chai.request(`http://localhost:${server.server.address().port}`)
      .get('/');
    chai.expect(res.text).to.be.equal('hello: foo');
    await server.stop();
  });
});
