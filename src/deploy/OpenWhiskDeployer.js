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

class OpenWhiskDeployer extends BaseDeployer {
  constructor(builder) {
    super(builder);

    Object.assign(this, {
      name: 'Openwhisk',
      _namespace: '',
      _packageShared: false,
    });
  }

  withNamespace(value) {
    this._namespace = value;
    return this;
  }

  withPackageShared(value) {
    this._packageShared = value;
    return this;
  }

  async init() {
    const wskPropsFile = process.env.WSK_CONFIG_FILE || path.resolve(os.homedir(), '.wskprops');
    let wskProps = {};
    if (await fse.pathExists(wskPropsFile)) {
      wskProps = dotenv.parse(await fse.readFile(wskPropsFile));
    }
    this._wskNamespace = this._wskNamespace || process.env.WSK_NAMESPACE || wskProps.NAMESPACE;
    this._wskAuth = this._wskAuth || process.env.WSK_AUTH || wskProps.AUTH;
    this._wskApiHost = this._wskApiHost || process.env.WSK_APIHOST || wskProps.APIHOST || 'https://adobeioruntime.net';
  }

  get host() {
    return this._wskApiHost.replace('https://', '').replace('/', '');
  }

  get basePath() {
    return `/api/v1/web${this.fullFunctionName}`;
  }

  // eslint-disable-next-line class-methods-use-this
  get urlVCL() {
    return `"/api/v1/web/${this._wskNamespace}/${this._builder.packageName}" + req.url`;
  }

  get fullFunctionName() {
    return `/${this._wskNamespace}/${this._builder.packageName}/${this._builder.name}`;
  }

  ready() {
    return !!this._wskApiHost && !!this._wskAuth && !!this._wskNamespace;
  }

  validate() {
    if (!this.ready()) {
      throw Error('Openwhisk target needs --wsk-host, --wsk-auth and --wsk-namespace');
    }
  }

  getOpenwhiskClient() {
    if (!this._wskApiHost || !this._wskAuth || !this._wskNamespace) {
      throw Error(chalk`\nMissing OpenWhisk credentials. Make sure you have a {grey .wskprops} in your home directory.\nYou can also set {grey WSK_NAMESPACE}, {gray WSK_AUTH} and {gray WSK_API_HOST} environment variables.`);
    }
    if (this._namespace && this._namespace !== this._wskNamespace) {
      throw Error(chalk`Openhwhisk namespace {grey '${this._wskNamespace}'} doesn't match configured namespace {grey '${this._namespace}'}.\nThis is a security measure to prevent accidental deployment dues to wrong .wskprops.`);
    }
    return ow({
      apihost: this._wskApiHost,
      api_key: this._wskAuth,
      namespace: this._wskNamespace,
    });
  }

  async deploy() {
    const openwhisk = this.getOpenwhiskClient();
    const relZip = path.relative(process.cwd(), this._builder.zipFile);
    this.log.info(`--: deploying ${relZip} as ${this._builder.actionName} ...`);
    const actionoptions = {
      name: this._builder.actionName,
      action: await fse.readFile(this._builder.zipFile),
      kind: `nodejs:${this._builder.nodeVersion}`,
      annotations: {
        'web-export': true,
        'raw-http': true,
        description: this._builder.pkgJson.description,
        pkgVersion: this._builder.version,
        dependencies: this._builder.dependencies.main.map((dep) => `${dep.name}:${dep.version}`).join(','),
        repository: this._builder.gitUrl,
        git: `${this._builder.gitOrigin}#${this._builder.gitRef}`,
        updated: this._builder.updatedAt,
      },
      params: this._builder.params,
      limits: {
        timeout: this._builder.timeout,
      },
    };
    if (this._builder.webSecure) {
      actionoptions.annotations['require-whisk-auth'] = this._builder.webSecure;
    }
    if (this._builder.updatedBy) {
      actionoptions.annotations.updatedBy = this._builder.updatedBy;
    }
    if (this._builder.memory) {
      actionoptions.limits.memory = this._builder.memory;
    }
    if (this._builder.concurrency) {
      actionoptions.limits.concurrency = this._builder.concurrency;
    }

    await openwhisk.actions.update(actionoptions);
    this.log.info(chalk`{green ok:} updated action {yellow ${`/${this._wskNamespace}/${this._builder.packageName}/${this._builder.name}`}}`);
    if (this._builder.showHints) {
      this.log.info('\nYou can verify the action with:');
      let opts = '';
      if (this._builder.webSecure === true) {
        opts = ' -u "$WSK_AUTH"';
      } else if (this._builder.webSecure) {
        opts = ` -H "x-require-whisk-auth: ${this._builder.webSecure}"`;
      }
      this.log.info(chalk`{grey $ curl${opts} "${this._wskApiHost}/api/v1/web${this.fullFunctionName}"}`);
    }
  }

  async delete() {
    const openwhisk = this.getOpenwhiskClient();
    this.log.info('--: deleting action ...');
    await openwhisk.actions.delete(this._builder._actionName);
    this.log.info(chalk`{green ok:} deleted action {yellow ${`/${this._wskNamespace}/${this._builder._packageName}/${this._builder._name}`}}`);
  }

  async updatePackage() {
    const openwhisk = this.getOpenwhiskClient();
    let fn = openwhisk.packages.update.bind(openwhisk.packages);
    let verb = 'updated';
    try {
      await openwhisk.packages.get(this._builder.packageName);
    } catch (e) {
      if (e.statusCode === 404) {
        fn = openwhisk.packages.create.bind(openwhisk.packages);
        verb = 'created';
      } else {
        this.log.error(`${chalk.red('error: ')} ${e.message}`);
      }
    }

    try {
      const parameters = Object.keys(this._builder.packageParams).map((key) => {
        const value = this._builder.packageParams[key];
        return { key, value };
      });
      const result = await fn({
        name: this._builder.packageName,
        package: {
          publish: this._packageShared,
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
    const headers = {};
    if (this._builder.webSecure === true) {
      headers.authorization = `Basic ${Buffer.from(this._wskAuth).toString('base64')}`;
    } else if (this._builder.webSecure) {
      headers['x-require-whisk-auth'] = this._webSecure;
    }
    return this.testRequest({
      url: `${this._wskApiHost}/api/v1/web${this.fullFunctionName}`,
      headers,
      idHeader: 'x-openwhisk-activation-id',
    });
  }

  async updateLinks(namePrefix) {
    // eslint-disable-next-line no-underscore-dangle
    const name = this._builder._name;
    // using `default` as package name doesn't work with sequences...
    const pkgPrefix = this._builder._linksPackage === 'default' ? '' : `${this._builder._linksPackage}/`;
    const prefix = `${pkgPrefix}${namePrefix}`;
    const pkgName = this._builder._packageName === 'default' ? '' : `${this._builder._packageName}/`;
    const fqn = `/${this._wskNamespace}/${pkgName}${name}`;

    const openwhisk = this.getOpenwhiskClient();

    const annotations = [
      { key: 'exec', value: 'sequence' },
      { key: 'web-export', value: true },
      { key: 'raw-http', value: true },
      { key: 'final', value: true },
      { key: 'updated', value: this._builder._updatedAt },
    ];
    if (this._builder._webSecure) {
      annotations.push({ key: 'require-whisk-auth', value: this._builder._webSecure });
    }
    if (this._updatedBy) {
      annotations.push({ key: 'updatedBy', value: this._updatedBy });
    }

    const sfx = this.getLinkVersions();
    let hasErrors = false;
    await Promise.all(sfx.map(async (sf) => {
      const options = {
        name: `${prefix}@${sf}`,
        action: {
          namespace: this._wskNamespace,
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

module.exports = OpenWhiskDeployer;
