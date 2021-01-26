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
const semver = require('semver');
const fetchAPI = require('@adobe/helix-fetch');

function fetchContext() {
  return process.env.HELIX_FETCH_FORCE_HTTP1
    ? fetchAPI.context({
      alpnProtocols: [fetchAPI.ALPN_HTTP1_1],
    })
    : fetchAPI;
}

class BaseDeployer {
  constructor(cfg) {
    this.isDeployer = true;
    this.cfg = cfg;
  }

  get log() {
    return this.cfg.log;
  }

  ready() {
    return this.cfg && false;
  }

  validate() {
    if (!this.ready()) {
      throw Error(`${this.name} target not valid.`);
    }
  }

  get relZip() {
    return path.relative(process.cwd(), this.cfg.zipFile);
  }

  get host() {
    // note: most derived classes can offer a better implementation,
    // this is the lowest common denominator
    if (this.cfg.functionURL) {
      return new URL(this.cfg.functionURL).hostname;
    }
    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  get urlVCL() {
    return 'req.url';
  }

  // eslint-disable-next-line class-methods-use-this
  get customVCL() {
    return '';
  }

  async testRequest({
    url,
    headers = {},
    idHeader,
    retry404 = 0,
  }) {
    const { fetch } = fetchContext();
    while (retry404 >= 0) {
      // eslint-disable-next-line no-param-reassign
      const testUrl = `${url}${this.cfg.testPath || ''}`;
      this.log.info(`--: requesting: ${chalk.blueBright(testUrl)} ...`);
      // eslint-disable-next-line no-await-in-loop
      const ret = await fetch(testUrl, {
        headers,
        redirect: 'manual',
      });
      // eslint-disable-next-line no-await-in-loop
      const body = await ret.text();
      const id = idHeader ? ret.headers.get(idHeader) : 'n/a';
      if (ret.ok) {
        this.log.info(`id: ${chalk.grey(id)}`);
        this.log.info(`${chalk.green('ok:')} ${ret.status}`);
        this.log.debug(chalk.grey(body));
        return;
      }
      if (ret.status === 302 || ret.status === 301) {
        this.log.info(`${chalk.green('ok:')} ${ret.status}`);
        this.log.debug(chalk.grey(`Location: ${ret.headers.get('location')}`));
        return;
      }
      this.log.info(`id: ${chalk.grey(id)}`);
      if ((ret.status === 404 || ret.status === 500) && retry404) {
        this.log.info(`${chalk.yellow('warn:')} ${ret.status} (retry)`);
        // eslint-disable-next-line no-param-reassign
        retry404 -= 1;
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } else {
        // this.log.info(`${chalk.red('error:')} test failed: ${ret.status} ${body}`);
        throw new Error(`test failed: ${ret.status} ${body}`);
      }
    }
  }

  /**
   * Can be used by deployers to run additional tasks, eg. custom commands.
   */
  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async runAdditionalTasks() {
  }

  /**
   * Returns the link versions based on the configruation. eg ['v8', 'ci']
   */
  getLinkVersions() {
    const sfx = [];
    // eslint-disable-next-line no-underscore-dangle
    const s = semver.parse(this.cfg.version);
    // eslint-disable-next-line no-underscore-dangle
    this.cfg.links.forEach((link) => {
      if (link === 'major' || link === 'minor') {
        if (!s) {
          // eslint-disable-next-line no-underscore-dangle
          this.log.warn(`${chalk.yellow('warn:')} unable to create version sequences. error while parsing version: ${this.cfg.version}`);
          return;
        }
        if (link === 'major') {
          sfx.push(`v${s.major}`);
        } else {
          sfx.push(`v${s.major}.${s.minor}`);
        }
      } else {
        sfx.push(link);
      }
    });
    return sfx;
  }
}

module.exports = BaseDeployer;
