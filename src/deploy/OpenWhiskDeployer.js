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
/* eslint-disable no-underscore-dangle */

const ow = require('openwhisk');
const os = require('os');
const fse = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const dotenv = require('dotenv');

const BaseDeployer = require('./BaseDeployer');
const OpenWhiskConfig = require('./OpenWhiskConfig.js');

class OpenWhiskDeployer extends BaseDeployer {
  constructor(baseConfig, config) {
    super(baseConfig);

    Object.assign(this, {
      id: 'wsk',
      name: 'Openwhisk',
      _cfg: config,
    });
  }

  async init() {
    const wskPropsFile = process.env.WSK_CONFIG_FILE || path.resolve(os.homedir(), '.wskprops');
    let wskProps = {};
    if (await fse.pathExists(wskPropsFile)) {
      wskProps = dotenv.parse(await fse.readFile(wskPropsFile));
    }
    this._cfg.propsNamespace = process.env.WSK_NAMESPACE || wskProps.NAMESPACE;
    this._cfg.namespace = this._cfg.namespace || this._cfg.propsNamespace;
    this._cfg.auth = process.env.WSK_AUTH || wskProps.AUTH;
    this._cfg.apiHost = process.env.WSK_APIHOST || wskProps.APIHOST || 'https://adobeioruntime.net';

    this._cfg.actionName = this.cfg.packageName === 'default'
      ? this.cfg.name
      : `${this.cfg.packageName}/${this.cfg.name}`;
  }

  get host() {
    return this._cfg.apiHost.replace('https://', '').replace('/', '');
  }

  get basePath() {
    return `/api/v1/web${this.fullFunctionName}`;
  }

  // eslint-disable-next-line class-methods-use-this
  get urlVCL() {
    return `"/api/v1/web/${this._cfg.namespace}/" + var.package + "/" + var.action + var.atversion + var.rest`;
  }

  get fullFunctionName() {
    return `/${this._cfg.namespace}/${this.cfg.packageName}/${this.cfg.name}`;
  }

  // eslint-disable-next-line class-methods-use-this
  get customVCL() {
    // set x-request-id (tracing from x-cdn-request-id)
    return `if (req.http.x-cdn-request-id != "") {
      set req.http.x-request-id = req.http.x-cdn-request-id;
    }`;
  }

  ready() {
    return !!this._cfg.apiHost && !!this._cfg.auth && !!this._cfg.propsNamespace;
  }

  validate() {
    if (!this.ready()) {
      throw Error('Openwhisk target needs --wsk-host, --wsk-auth and --wsk-namespace');
    }
    if (this._cfg.namespace !== this._cfg.propsNamespace) {
      throw Error(chalk`Openhwhisk namespace {grey '${this._cfg.propsNamespace}'} doesn't match configured namespace {grey '${this._cfg.namespace}'}.\nThis is a security measure to prevent accidental deployment due to wrong .wskprops.`);
    }
  }

  getOpenwhiskClient() {
    if (!this._cfg.apiHost || !this._cfg.auth || !this._cfg.namespace) {
      throw Error(chalk`\nMissing OpenWhisk credentials. Make sure you have a {grey .wskprops} in your home directory.\nYou can also set {grey WSK_NAMESPACE}, {gray WSK_AUTH} and {gray WSK_API_HOST} environment variables.`);
    }
    return ow({
      apihost: this._cfg.apiHost,
      api_key: this._cfg.auth,
      namespace: this._cfg.namespace,
    });
  }

  async deploy() {
    const { cfg } = this;
    const openwhisk = this.getOpenwhiskClient();
    const relZip = path.relative(process.cwd(), cfg.zipFile);
    this.log.info(`--: deploying ${relZip} as ${this._cfg.actionName} ...`);

    // ensure package
    try {
      await openwhisk.packages.get(cfg.packageName);
    } catch (e) {
      if (e.statusCode === 404) {
        this.log.info(`--: creating missing package ${cfg.packageName} ...`);
        const res = await openwhisk.packages.create({
          name: cfg.packageName,
          package: {
            publish: this._cfg.packageShared,
          },
        });
        this.log.info(chalk`{green ok:} package created. ${res.namespace}/${res.name}`);
      } else {
        this.log.error(`${chalk.red('error: ')} ${e.message}`);
      }
    }

    const actionoptions = {
      name: this._cfg.actionName,
      action: await fse.readFile(cfg.zipFile),
      kind: `nodejs:${cfg.nodeVersion}`,
      annotations: {
        'web-export': true,
        'raw-http': true,
        description: cfg.pkgJson.description,
        pkgVersion: cfg.version,
        dependencies: cfg.dependencies.index.map((dep) => `${dep.name}:${dep.version}`).join(','),
        repository: cfg.gitUrl,
        git: `${cfg.gitOrigin}#${cfg.gitRef}`,
        updated: cfg.updatedAt,
      },
      params: cfg.params,
      limits: {
        timeout: cfg.timeout,
      },
    };
    if (cfg.webSecure) {
      actionoptions.annotations['require-whisk-auth'] = cfg.webSecure;
    }
    if (cfg.updatedBy) {
      actionoptions.annotations.updatedBy = cfg.updatedBy;
    }
    if (cfg.memory) {
      actionoptions.limits.memory = cfg.memory;
    }
    if (cfg.concurrency) {
      actionoptions.limits.concurrency = cfg.concurrency;
    }

    await openwhisk.actions.update(actionoptions);
    this.log.info(chalk`{green ok:} updated action {yellow ${`/${this._cfg.namespace}/${cfg.packageName}/${cfg.name}`}}`);
    if (cfg.showHints) {
      this.log.info('\nYou can verify the action with:');
      let opts = '';
      if (cfg.webSecure === true) {
        opts = ' -u "$WSK_AUTH"';
      } else if (cfg.webSecure) {
        opts = ` -H "x-require-whisk-auth: ${cfg.webSecure}"`;
      }
      this.log.info(chalk`{grey $ curl${opts} "${this._cfg.apiHost}/api/v1/web${this.fullFunctionName}"}`);
    }
  }

  async delete() {
    const { cfg } = this;
    const openwhisk = this.getOpenwhiskClient();
    this.log.info('--: deleting action ...');
    await openwhisk.actions.delete(this._cfg.actionName);
    this.log.info(chalk`{green ok:} deleted action {yellow ${`/${this._cfg.namespace}/${cfg.packageName}/${cfg.name}`}}`);
  }

  async updatePackage() {
    const { cfg } = this;
    const openwhisk = this.getOpenwhiskClient();
    let fn = openwhisk.packages.update.bind(openwhisk.packages);
    let verb = 'updated';
    try {
      await openwhisk.packages.get(cfg.packageName);
    } catch (e) {
      if (e.statusCode === 404) {
        fn = openwhisk.packages.create.bind(openwhisk.packages);
        verb = 'created';
      } else {
        this.log.error(`${chalk.red('error: ')} ${e.message}`);
      }
    }

    try {
      const parameters = Object.keys(cfg.packageParams).map((key) => {
        const value = cfg.packageParams[key];
        return { key, value };
      });
      const result = await fn({
        name: cfg.packageName,
        package: {
          publish: this._cfg.packageShared,
          parameters,
        },
      });
      this.log.info(`${chalk.green('ok:')} ${verb} package ${chalk.whiteBright(`/${result.namespace}/${result.name}`)}`);
    } catch (e) {
      this.log.error(`${chalk.red('error: failed processing package: ')} ${e.stack}`);
      throw Error('abort.');
    }
  }

  async test() {
    const { cfg } = this;
    const headers = {};
    if (cfg.webSecure === true) {
      headers.authorization = `Basic ${Buffer.from(this._cfg.auth).toString('base64')}`;
    } else if (cfg.webSecure) {
      headers['x-require-whisk-auth'] = cfg.webSecure;
    }
    return this.testRequest({
      url: `${this._cfg.apiHost}/api/v1/web${this.fullFunctionName}`,
      headers,
      idHeader: 'x-openwhisk-activation-id',
    });
  }

  async updateLinks() {
    const { cfg } = this;
    const { name } = cfg;
    // using `default` as package name doesn't work with sequences...
    const pkgPrefix = cfg.linksPackage === 'default' ? '' : `${cfg.linksPackage}/`;
    const prefix = `${pkgPrefix}${cfg.baseName}`;
    const pkgName = cfg.packageName === 'default' ? '' : `${cfg.packageName}/`;
    const fqn = `/${this._cfg.namespace}/${pkgName}${name}`;

    const openwhisk = this.getOpenwhiskClient();

    const annotations = [
      { key: 'exec', value: 'sequence' },
      { key: 'web-export', value: true },
      { key: 'raw-http', value: true },
      { key: 'final', value: true },
      { key: 'updated', value: cfg.updatedAt },
    ];
    if (cfg.webSecure) {
      annotations.push({ key: 'require-whisk-auth', value: cfg.webSecure });
    }
    if (this.updatedBy) {
      annotations.push({ key: 'updatedBy', value: this.updatedBy });
    }

    const sfx = this.getLinkVersions();
    let hasErrors = false;
    await Promise.all(sfx.map(async (sf) => {
      const options = {
        name: `${prefix}@${sf}`,
        action: {
          namespace: this._cfg.namespace,
          name: `${prefix}@${sf}`,
          exec: {
            kind: 'sequence',
            components: [fqn],
          },
          annotations,
        },
        annotations,
      };

      try {
        this.log.debug(`creating sequence: ${options.name} -> ${options.action.exec.components[0]}`);
        const result = await openwhisk.actions.update(options);
        this.log.info(`${chalk.green('ok:')} created sequence ${chalk.whiteBright(`/${result.namespace}/${result.name}`)} -> ${chalk.whiteBright(fqn)}`);
      } catch (e) {
        hasErrors = true;
        this.log.error(`${chalk.red('error:')} failed creating sequence: ${e.message}`);
      }
    }));
    if (hasErrors) {
      throw new Error('Aborting due to errors during sequence updates.');
    }
  }
}

OpenWhiskDeployer.Config = OpenWhiskConfig;
module.exports = OpenWhiskDeployer;
