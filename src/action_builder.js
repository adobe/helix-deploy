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

/* eslint-disable no-console */

const path = require('path');
const fse = require('fs-extra');
const archiver = require('archiver');
const webpack = require('webpack');
const chalk = require('chalk');
const dotenv = require('dotenv');
const os = require('os');
const ow = require('openwhisk');
const request = require('request-promise-native');
const { version } = require('../package.json');

require('dotenv').config();

module.exports = class ActionBuilder {
  /**
   * Decoded the params string or file. First as JSON and if this fails, as ENV format.
   * @param {string} params Params string or file name
   * @param {boolean} isFile {@code true} to indicate a file.
   * @returns {*} Decoded params object.
   */
  static decodeParams(params, isFile) {
    let content = params;
    if (isFile) {
      if (!fse.existsSync(params)) {
        throw Error(`Specified param file does not exist: ${params}`);
      }
      content = fse.readFileSync(params, 'utf-8');
    }
    // first try JSON
    try {
      return JSON.parse(content);
    } catch (e) {
      // ignore
    }
    // then try env
    return dotenv.parse(content);
  }

  /**
   * Converts the given {@code obj} to ENV format.
   * @param {Object} obj the object to convert.
   * @returns {string} the formatted string.
   */
  static toEnv(obj) {
    let str = '';
    Object.keys(obj).forEach((k) => {
      str += `${k}=${JSON.stringify(obj[k])}\n`;
    });
    return str;
  }

  constructor() {
    this._cwd = process.cwd();
    this._distDir = null;
    this._name = null;
    this._file = null;
    this._zipFile = null;
    this._bundle = null;
    this._env = null;
    this._wskNamespace = null;
    this._wskAuth = null;
    this._wskApiHost = null;
    this._verbose = false;
    this._externals = [];
    this._docker = null;
    this._kind = null;
    this._deploy = false;
    this._test = false;
    this._statics = new Map();
    this._params = {};
    this._webAction = true;
    this._rawHttp = false;
    this._showHints = false;
    this._modules = [];
  }

  get log() {
    if (!this._logger) {
      // poor men's logging...
      this._logger = {
        debug: (...args) => { if (this._verbose) { console.log(...args); } },
        info: console.log,
        warn: console.warn,
        error: console.error,
      };
    }
    return this._logger;
  }

  verbose(enable) {
    this._verbose = enable;
    return this;
  }

  withDeploy(enable) {
    this._deploy = enable;
    return this;
  }

  withTest(enable) {
    this._test = enable;
    return this;
  }

  withHints(showHints) {
    this._showHints = showHints;
    return this;
  }

  withModules(value) {
    this._modules = value;
    return this;
  }

  withWebExport(value) {
    this._webAction = value;
    return this;
  }

  withRawHttp(value) {
    this._rawHttp = value;
    return this;
  }

  withExternals(value) {
    this._externals = (Array.isArray(value) ? value : [value]).map((e) => {
      if (typeof e === 'string' && e.startsWith('/') && e.endsWith('/')) {
        return new RegExp(e.substring(1, e.length - 1));
      }
      return e;
    });
    return this;
  }

  withStatic(srcPath, dstRelPath) {
    if (!srcPath) {
      return this;
    }

    if (Array.isArray(srcPath)) {
      srcPath.forEach((v) => {
        this._statics.set(v, v);
      });
    } else {
      this._statics.set(srcPath, dstRelPath);
    }
    return this;
  }

  withParams(params, forceFile) {
    if (!params) {
      return this;
    }
    if (Array.isArray(params)) {
      params.forEach((v) => {
        this._params = Object.assign(this._params, ActionBuilder.decodeParams(v, forceFile));
      });
    } else {
      this._params = Object.assign(this._params, ActionBuilder.decodeParams(params, forceFile));
    }
    return this;
  }

  withParamsFile(params) {
    return this.withParams(params, true);
  }

  withName(value) {
    this._name = value;
    return this;
  }

  withKind(value) {
    this._kind = value;
    return this;
  }

  withDocker(value) {
    this._docker = value;
    return this;
  }

  withEntryFile(value) {
    this._file = value;
    return this;
  }

  async validate() {
    try {
      this._pkgJson = await fse.readJson(path.resolve(this._cwd, 'package.json'));
    } catch (e) {
      this._pkgJson = {};
    }
    this._file = path.resolve(this._cwd, this._file || 'index.js');
    if (!this._env) {
      this._env = path.resolve(this._cwd, '.env');
    }
    if (!this._distDir) {
      this._distDir = path.resolve(this._cwd, 'dist');
    }
    if (!this._name) {
      this._name = this._pkgJson.name || path.basename(this._cwd);
    }
    if (!this._zipFile) {
      this._zipFile = path.resolve(this._distDir, `${this._name}.zip`);
    }
    if (!this._bundle) {
      this._bundle = path.resolve(this._distDir, `${this._name}-bundle.js`);
    }

    this._actionName = this._name.indexOf('/') < 0 ? `default/${this._name}` : this._name;

    // init openwhisk props
    const wskPropsFile = path.resolve(os.homedir(), '.wskprops');
    let wskProps = {};
    if (await fse.pathExists(wskPropsFile)) {
      wskProps = dotenv.parse(await fse.readFile(wskPropsFile));
    }
    this._wskNamespace = this._wskNamespace || wskProps.NAMESPACE || process.env.WSK_NAMESPACE;
    this._wskAuth = this._wskAuth || wskProps.AUTH || process.env.WSK_AUTH;
    this._wskApiHost = this._wskApiHost || wskProps.APIHOST || process.env.WSK_APIHOST || 'https://adobeioruntime.net';

    if (this._rawHttp && !this._webAction) {
      throw new Error('raw-http requires web-export');
    }
  }

  async createArchive() {
    return new Promise(async (resolve, reject) => {
      // create zip file for package
      const output = fse.createWriteStream(this._zipFile);
      const archive = archiver('zip');
      this.log.debug('Creating: ', path.relative(this._cwd, this._zipFile));

      let hadErrors = false;
      output.on('close', () => {
        if (!hadErrors) {
          this.log.debug(' %d total bytes', archive.pointer());
          resolve();
        }
      });
      archive.on('entry', (data) => {
        this.log.debug(' - %s', data.name);
      });
      archive.on('warning', (err) => {
        hadErrors = true;
        reject(err);
      });
      archive.on('error', (err) => {
        hadErrors = true;
        reject(err);
      });

      const packageJson = {
        name: this._name,
        version: '1.0',
        description: `OpenWhisk Action of ${this._name}`,
        main: 'main.js',
        license: 'Apache-2.0',
      };

      archive.pipe(output);
      await this.updateArchive(archive, packageJson);
      archive.finalize();
    });
  }

  async updateArchive(archive, packageJson) {
    archive.file(this._bundle, { name: 'main.js' });
    this._statics.forEach((src, name) => {
      archive.file(src, { name });
    });
    this._modules.forEach((mod) => {
      archive.directory(path.resolve(this._cwd, `node_modules/${mod}`), `node_modules/${mod}`);
    });
    archive.append(JSON.stringify(packageJson, null, '  '), { name: 'package.json' });
  }

  async createPackage() {
    const compiler = webpack({
      target: 'node',
      mode: 'development',
      entry: this._file,
      output: {
        path: this._cwd,
        filename: path.relative(this._cwd, this._bundle),
        library: 'main',
        libraryTarget: 'umd',
      },
      devtool: false,
      externals: this._externals,
    });

    return new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err) {
          reject(err);
          return;
        }
        this.log.debug(stats.toString({
          chunks: false,
          colors: true,
        }));
        resolve();
      });
    });
  }

  async prepare() {
    await this.createPackage();
  }

  async deploy() {
    const openwhisk = ow({
      apihost: this._wskApiHost,
      api_key: this._wskAuth,
      namespace: this._wskNamespace,
    });


    const relZip = path.relative(process.cwd(), this._zipFile);
    this.log.debug(`Deploying ${relZip} as ${this._name} to OpenWhisk`);
    const actionoptions = {
      name: this._name,
      action: await fse.readFile(this._zipFile),
      kind: this._docker ? 'blackbox' : this._kind,
      annotations: {
        description: this._pkgJson.description,
        'web-export': this._webAction,
        'raw-http': this._rawHttp,
      },
      params: this._params,
    };
    if (this._docker) {
      actionoptions.exec = {
        image: this._docker,
      };
    }

    const result = await openwhisk.actions.update(actionoptions);
    this.log.info(`${chalk.green('ok:')} updated action ${chalk.whiteBright(`${result.namespace}/${result.name}`)}`);
    if (this._showHints) {
      this.log.info('\nYou can verify the action with:');
      this.log.info(chalk.grey(`$ curl "${this._wskApiHost}/api/v1/web/${result.namespace}/${result.name}"`));
    }
  }

  async test() {
    if (this._webAction) {
      return this.testRequest();
    }
    return this.testInvoke();
  }

  async testRequest() {
    const url = `${this._wskApiHost}/api/v1/web/${this._wskNamespace}/${this._actionName}`;
    this.log.info(`--: requesting: ${chalk.blueBright(url)} ...`);
    try {
      const ret = await request({
        url,
        followRedirect: false,
      });
      this.log.info(`${chalk.green('ok:')} 200`);
      this.log.debug(chalk.grey(ret));
    } catch (e) {
      if (e.statusCode === 302 || e.statusCode === 301) {
        this.log.info(`${chalk.green('ok:')} ${e.statusCode}`);
        this.log.debug(chalk.grey(`Location: ${e.response.headers.location}`));
      } else {
        this.log.error(`${chalk.red('error: ')} ${e.message}`);
      }
    }
  }

  async testInvoke() {
    const openwhisk = ow({
      apihost: this._wskApiHost,
      api_key: this._wskAuth,
      namespace: this._wskNamespace,
    });

    this.log.info(`--: invoking: ${chalk.blueBright(this._name)} ...`);
    try {
      const ret = await openwhisk.actions.invoke({
        name: this._name,
        blocking: true,
        result: true,
      });
      this.log.info(`${chalk.green('ok:')} 200`);
      this.log.debug(chalk.grey(JSON.stringify(ret, null, '  ')));
    } catch (e) {
      this.log.error(`${chalk.red('error: ')} ${e.message}`);
    }
  }

  async showDeployHints() {
    const relZip = path.relative(process.cwd(), this._zipFile);
    this.log.info('Deploy to openwhisk the following command or specify --deploy on the commandline:');
    if (this._docker) {
      this.log.info(chalk.grey(`$ wsk action update ${this._name} --docker ${this._docker} --web raw ${relZip}`));
    } else {
      this.log.info(chalk.grey(`$ wsk action update ${this._name} --kind ${this._kind} --web raw ${relZip}`));
    }
  }

  async run() {
    this.log.info(chalk`{grey openwhisk-action-builder v${version}}`);
    await this.validate();
    await this.prepare();
    await this.createArchive();
    const relZip = path.relative(process.cwd(), this._zipFile);
    this.log.info(`${chalk.green('ok:')} created action: ${chalk.whiteBright(relZip)}.`);
    if (this._deploy) {
      await this.deploy();
    } else if (this._showHints) {
      await this.showDeployHints();
    }

    if (this._test) {
      await this.test();
    }
  }
};
