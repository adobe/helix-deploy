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
const path = require('path');
const chalk = require('chalk');
const fetchAPI = require('@adobe/helix-fetch');

const { fetch } = process.env.HELIX_FETCH_FORCE_HTTP1
  ? fetchAPI.context({
    httpProtocol: 'http1',
    httpsProtocols: ['http1'],
  })
  : fetchAPI;

class BaseDeployer {
  constructor(builder) {
    this._builder = builder;
  }

  get log() {
    return this._builder.log;
  }

  ready() {
    return this._builder && false;
  }

  validate() {
    if (!this.ready()) {
      throw Error(`${this.name} target not valid.`);
    }
  }

  get relZip() {
    return path.relative(process.cwd(), this._builder.zipFile);
  }

  async testRequest({
    url,
    headers = {},
    idHeader,
  }) {
    const testUrl = `${url}${this._builder.testPath || ''}`;
    this.log.info(`--: requesting: ${chalk.blueBright(testUrl)} ...`);
    const ret = await fetch(testUrl, {
      headers,
    });
    const body = await ret.text();
    const id = idHeader ? ret.headers.get(idHeader) : 'n/a';
    if (ret.ok) {
      this.log.info(`id: ${chalk.grey(id)}`);
      this.log.info(`${chalk.green('ok:')} ${ret.status}`);
      this.log.debug(chalk.grey(body));
    } else {
      this.log.info(`id: ${chalk.grey(id)}`);
      if (ret.status === 302 || ret.status === 301) {
        this.log.info(`${chalk.green('ok:')} ${ret.status}`);
        this.log.debug(chalk.grey(`Location: ${ret.headers.get('location')}`));
      } else {
        throw new Error(`test failed: ${ret.status} ${body}`);
      }
    }
  }
}

module.exports = BaseDeployer;
