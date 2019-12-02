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

const path = require('path');
const fse = require('fs-extra');
const archiver = require('archiver');
const webpack = require('webpack');
const chalk = require('chalk');
const dotenv = require('dotenv');
const os = require('os');
const ow = require('openwhisk');
const semver = require('semver');
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
  decodeParams(params, isFile) {
    let content = params;
    let cwd = this._cwd;
    if (isFile) {
      if (!fse.existsSync(params)) {
        throw Error(`Specified param file does not exist: ${params}`);
      }
      content = fse.readFileSync(params, 'utf-8');
      cwd = path.dirname(params);
    }
    let data;
    if (typeof params === 'object') {
      data = content;
    } else {
      // first try JSON
      try {
        data = JSON.parse(content);
      } catch (e) {
        // then try env
        data = dotenv.parse(content);
      }
    }

    const resolve = (obj) => {
      // resolve file references
      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        if (typeof value === 'object') {
          resolve(value);
        } else {
          const param = String(value);
          if (param.startsWith('@') && !param.startsWith('@@')) {
            const filePath = path.resolve(cwd, param.substring(1));
            // eslint-disable-next-line no-param-reassign
            obj[key] = `@${filePath}`;
          }
        }
      });
    };
    resolve(data);
    return data;
  }

  /**
   * Iterates the given params and resolves potential file references.
   * @param {object} params the params
   * @returns the resolved object.
   */
  static async resolveParams(params) {
    const tasks = [];
    const resolve = async (obj, key, file) => {
      // eslint-disable-next-line no-param-reassign
      obj[key] = await fse.readFile(file, 'utf-8');
    };

    const resolver = (obj) => {
      Object.keys(obj).forEach((key) => {
        const param = obj[key];
        if (typeof param === 'object') {
          resolver(param);
        } else {
          const value = String(param);
          if (value.startsWith('@@')) {
            // eslint-disable-next-line no-param-reassign
            obj[key] = value.substring(1);
          } else if (value.startsWith('@')) {
            tasks.push(resolve(obj, key, value.substring(1)));
          } else {
            // eslint-disable-next-line no-param-reassign
            obj[key] = value;
          }
        }
      });
    };
    resolver(params);
    await Promise.all(tasks);
    return params;
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
    Object.assign(this, {
      _cwd: process.cwd(),
      _distDir: null,
      _name: null,
      _version: null,
      _file: null,
      _zipFile: null,
      _bundle: null,
      _env: null,
      _wskNamespace: null,
      _wskAuth: null,
      _wskApiHost: null,
      _verbose: false,
      _externals: [],
      _docker: null,
      _kind: null,
      _deploy: false,
      _test: null,
      _statics: new Map(),
      _params: {},
      _webAction: true,
      _webSecure: '',
      _rawHttp: false,
      _showHints: false,
      _modules: [],
      _build: true,
      _updatePackage: false,
      _actionName: '',
      _packageName: '',
      _packageShared: false,
      _packageParams: {},
      _timeout: 60000,
      _links: [],
      _linksPackage: null,
    });
  }

  get log() {
    if (!this._logger) {
      // poor men's logging...
      /* eslint-disable no-console */
      this._logger = {
        debug: (...args) => { if (this._verbose) { console.error(...args); } },
        info: console.error,
        warn: console.error,
        error: console.error,
      };
      /* eslint-enable no-console */
    }
    return this._logger;
  }

  verbose(enable) {
    this._verbose = enable;
    return this;
  }

  withDirectory(value) {
    this._cwd = value === '.' ? process.cwd() : value;
    return this;
  }

  withDeploy(enable) {
    this._deploy = enable;
    return this;
  }

  withBuild(enable) {
    this._build = enable;
    return this;
  }

  withUpdatePackage(enable) {
    this._updatePackage = enable;
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

  withWebSecure(value) {
    this._webSecure = value;
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
        this._params = Object.assign(this._params, this.decodeParams(v, forceFile));
      });
    } else {
      this._params = Object.assign(this._params, this.decodeParams(params, forceFile));
    }
    return this;
  }

  withPackageParams(params, forceFile) {
    if (!params) {
      return this;
    }
    if (Array.isArray(params)) {
      params.forEach((v) => {
        // eslint-disable-next-line max-len
        this._packageParams = Object.assign(this._packageParams, this.decodeParams(v, forceFile));
      });
    } else {
      // eslint-disable-next-line max-len
      this._packageParams = Object.assign(this._packageParams, this.decodeParams(params, forceFile));
    }
    return this;
  }

  withParamsFile(params) {
    return this.withParams(params, true);
  }

  withPackageParamsFile(params) {
    return this.withPackageParams(params, true);
  }

  withName(value) {
    this._name = value;
    return this;
  }

  withVersion(value) {
    this._version = value;
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

  withPackageShared(value) {
    this._packageShared = value;
    return this;
  }

  withPackageName(value) {
    this._packageName = value;
    return this;
  }

  withTimeout(value) {
    this._timeout = value;
    return this;
  }

  withLinks(value) {
    this._links = value || [];
    return this;
  }

  withLinksPackage(value) {
    this._linksPackage = value;
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
    if (!this._version) {
      this._version = this._pkgJson.version || '0.0.0';
    }
    // do some very simple variable substitution
    // eslint-disable-next-line no-template-curly-in-string
    this._name = this._name.replace('${version}', this._version);

    const segs = this._name.split('/');
    this._name = segs.pop();
    if (segs.length > 0 && !this._packageName) {
      this._packageName = segs.pop();
    }
    this._actionName = `${this._packageName}/${this._name}`;
    if (!this._packageName) {
      this._packageName = 'default';
      this._actionName = this._name;
    }
    if (!this._linksPackage) {
      this._linksPackage = this._packageName;
    }

    if (!this._zipFile) {
      this._zipFile = path.resolve(this._distDir, this._packageName, `${this._name}.zip`);
    }
    if (!this._bundle) {
      this._bundle = path.resolve(this._distDir, this._packageName, `${this._name}-bundle.js`);
    }

    // create dist dir
    await fse.ensureDir(this._distDir);

    // init openwhisk props
    const wskPropsFile = path.resolve(os.homedir(), '.wskprops');
    let wskProps = {};
    if (await fse.pathExists(wskPropsFile)) {
      wskProps = dotenv.parse(await fse.readFile(wskPropsFile));
    }
    this._wskNamespace = this._wskNamespace || process.env.WSK_NAMESPACE || wskProps.NAMESPACE;
    this._wskAuth = this._wskAuth || process.env.WSK_AUTH || wskProps.AUTH;
    this._wskApiHost = this._wskApiHost || process.env.WSK_APIHOST || wskProps.APIHOST || 'https://adobeioruntime.net';

    if (this._rawHttp && !this._webAction) {
      throw new Error('raw-http requires web-export');
    }
    this._params = await ActionBuilder.resolveParams(this._params);
    this._packageParams = await ActionBuilder.resolveParams(this._packageParams);
  }

  async createArchive() {
    return new Promise((resolve, reject) => {
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
        name: this._actionName,
        version: this._version,
        description: `OpenWhisk Action of ${this._name}`,
        main: 'main.js',
        license: 'Apache-2.0',
      };

      archive.pipe(output);
      this.updateArchive(archive, packageJson).then(() => {
        archive.finalize();
      });
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

  async getWebpackConfig() {
    return {
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
      module: {
        rules: [{
          test: /\.mjs$/,
          type: 'javascript/auto',
        }],
      },
      resolve: {
        mainFields: ['main', 'module'],
        extensions: ['.wasm', '.js', '.mjs', '.json'],
      },
      node: {
        __dirname: true,
      },
    };
  }

  async createPackage() {
    const compiler = webpack(await this.getWebpackConfig());
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

  async validateBundle() {
    this.log.info('--: validating bundle ...');
    let module;
    try {
      // eslint-disable-next-line global-require,import/no-dynamic-require
      module = require(this._bundle);
    } catch (e) {
      this.log.error(chalk`{red error:}`, e);
      throw Error(`Validation failed: ${e}`);
    }
    if (!module.main && typeof module.main !== 'function') {
      throw Error('Validation failed: Action has no main() function.');
    }
    this.log.info(chalk`{green ok:} bundle can be loaded and has a {gray main()} function.\n`);
  }

  async deploy() {
    const openwhisk = ow({
      apihost: this._wskApiHost,
      api_key: this._wskAuth,
      namespace: this._wskNamespace,
    });

    const relZip = path.relative(process.cwd(), this._zipFile);
    this.log.debug(`Deploying ${relZip} as ${this._actionName} to OpenWhisk`);
    const actionoptions = {
      name: this._actionName,
      action: await fse.readFile(this._zipFile),
      kind: this._docker ? 'blackbox' : this._kind,
      annotations: {
        description: this._pkgJson.description,
        'web-export': this._webAction,
        'raw-http': this._rawHttp,
      },
      params: this._params,
      limits: {
        timeout: this._timeout,
      },
    };
    if (this._docker) {
      actionoptions.exec = {
        image: this._docker,
      };
    }
    if (this._webSecure) {
      actionoptions.annotations['require-whisk-auth'] = this._webSecure;
    }

    const result = await openwhisk.actions.update(actionoptions);
    this.log.info(`${chalk.green('ok:')} updated action ${chalk.whiteBright(`/${result.namespace}/${result.name}`)}`);
    if (this._showHints) {
      this.log.info('\nYou can verify the action with:');
      if (this._webAction) {
        let opts = '';
        if (this._webSecure) {
          opts = ` -H "x-require-whisk-auth: ${this._webSecure}"`;
        }
        this.log.info(chalk.grey(`$ curl${opts} "${this._wskApiHost}/api/v1/web/${result.namespace}/${result.name}"`));
      } else {
        this.log.info(chalk.grey(`$ wsk action invoke -r ${result.name}`));
      }
    }
  }

  async updatePackage() {
    const openwhisk = ow({
      apihost: this._wskApiHost,
      api_key: this._wskAuth,
      namespace: this._wskNamespace,
    });
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

  async test(url) {
    if (this._webAction) {
      return this.testRequest(url);
    }
    return this.testInvoke();
  }

  async testRequest(relUrl) {
    const url = `${this._wskApiHost}/api/v1/web/${this._wskNamespace}/${this._packageName}/${this._name}${relUrl}`;
    this.log.info(`--: requesting: ${chalk.blueBright(url)} ...`);
    const headers = {};
    if (this._webSecure) {
      headers['x-require-whisk-auth'] = this._webSecure;
    }
    try {
      const ret = await request({
        url,
        followRedirect: false,
        headers,
        resolveWithFullResponse: true,
      });
      this.log.info(`id: ${chalk.grey(ret.headers['x-openwhisk-activation-id'])}`);
      this.log.info(`${chalk.green('ok:')} 200`);
      this.log.debug(chalk.grey(ret.body));
    } catch (e) {
      this.log.info(`id: ${chalk.grey(e.response.headers['x-openwhisk-activation-id'])}`);
      if (e.statusCode === 302 || e.statusCode === 301) {
        this.log.info(`${chalk.green('ok:')} ${e.statusCode}`);
        this.log.debug(chalk.grey(`Location: ${e.response.headers.location}`));
      } else {
        throw new Error(`test failed: ${e.message}`);
      }
    }
  }

  async testInvoke() {
    const openwhisk = ow({
      apihost: this._wskApiHost,
      api_key: this._wskAuth,
      namespace: this._wskNamespace,
    });

    this.log.info(`--: invoking: ${chalk.blueBright(this._actionName)} ...`);
    try {
      const ret = await openwhisk.actions.invoke({
        name: this._actionName,
        blocking: true,
        result: true,
      });
      this.log.info(`${chalk.green('ok:')} 200`);
      this.log.debug(chalk.grey(JSON.stringify(ret, null, '  ')));
    } catch (e) {
      throw new Error(`test failed: ${e.message}`);
    }
  }

  async showDeployHints() {
    const relZip = path.relative(process.cwd(), this._zipFile);
    this.log.info('Deploy to openwhisk the following command or specify --deploy on the commandline:');
    if (this._docker) {
      this.log.info(chalk.grey(`$ wsk action update ${this._actionName} --docker ${this._docker} --web raw ${relZip}`));
    } else {
      this.log.info(chalk.grey(`$ wsk action update ${this._actionName} --kind ${this._kind} --web raw ${relZip}`));
    }
  }

  async updateLinks() {
    if (this._links.length === 0) {
      return;
    }
    const idx = this._name.lastIndexOf('@');
    if (idx < 0) {
      this.log.warn(`${chalk.yellow('warn:')} unable to create version sequence. unsupported action name format. should be: "name@version"`);
      return;
    }
    const prefix = `${this._linksPackage}/${this._name.substring(0, idx + 1)}`;
    const s = semver.parse(this._version);
    const fqn = `/${this._wskNamespace}/${this._packageName}/${this._name}`;
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

    const openwhisk = ow({
      apihost: this._wskApiHost,
      api_key: this._wskAuth,
      namespace: this._wskNamespace,
    });

    const annotations = [{
      key: 'exec',
      value: 'sequence',
    }, {
      key: 'web-export',
      value: this._webAction,
    }, {
      key: 'raw-http',
      value: this._rawHttp,
    }, {
      key: 'final',
      value: true,
    }];
    if (this._webSecure) {
      annotations.push({
        key: 'require-whisk-auth',
        value: this._webSecure,
      });
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

  async run() {
    this.log.info(chalk`{grey openwhisk-action-builder v${version}}`);
    await this.validate();
    if (this._build) {
      await this.prepare();
      await this.createArchive();
      const relZip = path.relative(process.cwd(), this._zipFile);
      this.log.info(`${chalk.green('ok:')} created action: ${chalk.whiteBright(relZip)}.`);
      await this.validateBundle();
    }

    if (this._updatePackage) {
      await this.updatePackage();
    }
    if (this._deploy) {
      await this.deploy();
    } else if (this._showHints) {
      await this.showDeployHints();
    }

    if (typeof this._test === 'string') {
      await this.test(this._test);
    }

    await this.updateLinks();

    return {
      name: `openwhisk;host=${this._wskApiHost}`,
      url: `/${this._wskNamespace}/${this._packageName}/${this._name}`,
    };
  }
};
