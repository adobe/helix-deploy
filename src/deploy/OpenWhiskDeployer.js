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
const ow = require('openwhisk');
const semver = require('semver');
const fetchAPI = require('@adobe/helix-fetch');
const os = require('os');
const fse = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const dotenv = require('dotenv');

const BaseDeployer = require('./BaseDeployer');

const { fetch } = process.env.HELIX_FETCH_FORCE_HTTP1
  ? fetchAPI.context({
    httpProtocol: 'http1',
    httpsProtocols: ['http1'],
  })
  : fetchAPI;

class OpenWhiskDeployer extends BaseDeployer {
  constructor(builder) {
    super(builder);

    Object.assign(this, {
      _packageName: '',
      _namespace: '',
    });
  }

  withPackageName(value) {
    this._packageName = value;
    return this;
  }

  withNamespace(value) {
    this._namespace = value;
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
    return this._wskApiHost;
  }

  get fullFunctionName() {
    return `/${this._wskNamespace}/${this._builder.packageName}/${this._builder.name}`;
  }

  ready() {
    return !!this._wskApiHost && !!this._wskAuth && !!this._wskNamespace;
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
    this.log.info(`--: deploying ${relZip} as ${this._builder.actionName} …`);
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
    await openwhisk.actions.delete(this._actionName);
    this.log.info(chalk`{green ok:} deleted action {yellow ${`/${this._wskNamespace}/${this._packageName}/${this._name}`}}`);
  }

  async updatePackage() {
    const openwhisk = this.getOpenwhiskClient();
    let fn = openwhisk.packages.update.bind(openwhisk.packages);
    let verb = 'updated';
    try {
      await openwhisk.packages.get(this._packageName);
    } catch (e) {
      if (e.statusCode === 404) {
        fn = openwhisk.packages.create.bind(openwhisk.packages);
        verb = 'created';
      } else {
        this.log.error(`${chalk.red('error: ')} ${e.message}`);
      }
    }

    try {
      const parameters = Object.keys(this._packageParams).map((key) => {
        const value = this._packageParams[key];
        return { key, value };
      });
      const result = await fn({
        name: this._packageName,
        package: {
          publish: this._packageShared,
          parameters,
        },
      });
      this.log.info(`${chalk.green('ok:')} ${verb} package ${chalk.whiteBright(`/${result.namespace}/${result.name}`)}`);
    } catch (e) {
      this.log.error(`${chalk.red('error: failed processing package: ')} ${e.message}`);
      throw Error('abort.');
    }
  }

  async test() {
    return this.testRequest();
  }

  async testRequest() {
    const url = `${this._wskApiHost}/api/v1/web${this.fullFunctionName}${this._builder.testPath || ''}`;
    this.log.info(`--: requesting: ${chalk.blueBright(url)} ...`);
    const headers = {};
    if (this._builder.webSecure === true) {
      headers.authorization = `Basic ${Buffer.from(this._wskAuth).toString('base64')}`;
    } else if (this._builder.webSecure) {
      headers['x-require-whisk-auth'] = this._webSecure;
    }
    const ret = await fetch(url, {
      headers,
    });
    const body = await ret.text();
    const id = ret.headers.get('x-openwhisk-activation-id');
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

  async showDeployHints() {
    const relZip = path.relative(process.cwd(), this._builder.zipFile);
    this.log.info('Deploy to openwhisk the following command or specify --deploy on the commandline:');
    this.log.info(chalk.grey(`$ wsk action update ${this._builder.actionName} --kind nodejs:${this._builder.nodeVersion} --web raw ${relZip}`));
  }

  async updateLinks() {
    // TODO: build
    if (!this._links || this._links.length === 0) {
      return;
    }
    const idx = this._name.lastIndexOf('@');
    if (idx < 0) {
      this.log.warn(`${chalk.yellow('warn:')} unable to create version sequence. unsupported action name format. should be: "name@version"`);
      return;
    }
    // using `default` as package name doesn't work with sequences...
    const pkgPrefix = this._linksPackage === 'default' ? '' : `${this._linksPackage}/`;
    const prefix = `${pkgPrefix}${this._name.substring(0, idx + 1)}`;
    const s = semver.parse(this._version);
    const pkgName = this._packageName === 'default' ? '' : `${this._packageName}/`;
    const fqn = `/${this._wskNamespace}/${pkgName}${this._name}`;
    const sfx = [];
    this._links.forEach((link) => {
      if (link === 'major' || link === 'minor') {
        if (!s) {
          this.log.warn(`${chalk.yellow('warn:')} unable to create version sequences. error while parsing version: ${this._version}`);
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

    const openwhisk = this.getOpenwhiskClient();

    const annotations = [
      { key: 'exec', value: 'sequence' },
      { key: 'web-export', value: this._webAction },
      { key: 'raw-http', value: this._rawHttp },
      { key: 'final', value: true },
      { key: 'updated', value: this._updatedAt },
    ];
    if (this._webSecure) {
      annotations.push({ key: 'require-whisk-auth', value: this._webSecure });
    }
    if (this._updatedBy) {
      annotations.push({ key: 'updatedBy', value: this._updatedBy });
    }

    let hasErrors = false;
    await Promise.all(sfx.map(async (sf) => {
      const options = {
        name: `${prefix}${sf}`,
        action: {
          namespace: this._wskNamespace,
          name: `${prefix}${sf}`,
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
