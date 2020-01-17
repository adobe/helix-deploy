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
/* eslint-disable no-underscore-dangle */

const express = require('express');
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const DevelopmentServer = require('../src/DevelopmentServer.js');

describe('Server Test', () => {
  it('it can start an stop the server', async () => {
    const App = () => {
      const app = express();
      app.get('/', (req, res) => {
        res.send(`hello: ${req.owActionParams.TEST_PARAM}`);
      });
      return app;
    };

    const server = new DevelopmentServer(App).withPort(0);
    await server.init();
    server.params.TEST_PARAM = 'foo';
    await server.start();

    const res = await chai.request(`http://localhost:${server.server.address().port}`)
      .get('/');
    chai.expect(res.text).to.be.equal('hello: foo');
    await server.stop();
  });
});
