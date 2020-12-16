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
const fs = require('fs');
const fse = require('fs-extra');
const archiver = require('archiver');
const webpack = require('webpack');
const chalk = require('chalk');
const dotenv = require('dotenv');
const git = require('isomorphic-git');
const { version } = require('../package.json');
const OpenWhiskDeployer = require('./deploy/OpenWhiskDeployer');
const AWSDeployer = require('./deploy/AWSDeployer');
const AzureDeployer = require('./deploy/AzureDeployer');

require('dotenv').config();

/**
 * Returns the `origin` remote url or `''` if none is defined.
 *
 * @param {string} dir working tree directory path of the git repo
 * @returns {Promise<string>} `origin` remote url
 */
async function getOrigin(dir) {
  try {
    const rmt = (await git.listRemotes({ fs, dir })).find((entry) => entry.remote === 'origin');
    return typeof rmt === 'object' ? rmt.url : '';
  } catch (e) {
    // don't fail if directory is not a git repository
    return '';
  }
}

/**
 * Returns the sha of the current (i.e. `HEAD`) commit.
 *
 * @param {string} dir working tree directory path of the git repo
 * @returns {Promise<string>} sha of the current (i.e. `HEAD`) commit
 */
async function getCurrentRevision(dir) {
  try {
    return await git.resolveRef({ fs, dir, ref: 'HEAD' });
  } catch (e) {
    // ignore if no git repository
    return '';
  }
}

module.exports = class ActionBuilder {
  /**
   * Decoded the params string or file. First as JSON and if this fails, as ENV format.
   * @param {string} params Params string or file name
   * @param {boolean} isFile {@code true} to indicate a file.
   * @param {boolean} warnError {@code true} to only issue warning instead of throwing error
   * @returns {*} Decoded params object.
   */
  decodeParams(params, isFile, warnError) {
    let content = params;
    let cwd = this._cwd;
    if (isFile) {
      if (!fse.existsSync(params)) {
        if (warnError) {
          this.log.info(chalk`{yellow warn:} specified param file does not exist: ${params}`);
          return {};
        }
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
      _verbose: false,
      _externals: [],
      _nodeVersion: null,
      _deploy: false,
      _test: null,
      _test_params: {},
      _statics: [],
      _params: {},
      _webSecure: false,
      _showHints: false,
      _modules: [],
      _build: true,
      _delete: false,
      _updatePackage: false,
      _actionName: '',
      _packageName: '',
      _packageParams: {},
      _timeout: 60000,
      _concurrency: null,
      _memory: null,
      _links: [],
      _linksPackage: null,
      _dependencies: {},
      _gitUrl: '',
      _gitOrigin: '',
      _gitRef: '',
      _updatedAt: null,
      _updatedBy: null,
      _target: [],
      _deployers: {
        wsk: new OpenWhiskDeployer(this),
        aws: new AWSDeployer(this),
        azure: new AzureDeployer(this),
      },
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

  withTarget(value) {
    this._target = [];
    value.forEach((v) => {
      v.split(',').forEach((t) => {
        this._target.push(t.trim());
      });
    });
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

  withDelete(enable) {
    this._delete = enable;
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

  withTestParams(params) {
    if (!params) {
      return this;
    }
    if (Array.isArray(params)) {
      params.forEach((v) => {
        this._test_params = Object.assign(this._test_params, this.decodeParams(v, false));
      });
    } else {
      this._test_params = Object.assign(this._test_params, this.decodeParams(params, false));
    }
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
        if (Array.isArray(v)) {
          this._statics.push(v);
        } else {
          this._statics.push([v, v]);
        }
      });
    } else {
      this._statics.push([srcPath, dstRelPath]);
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
    const warnError = !this._updatePackage;
    if (Array.isArray(params)) {
      params.forEach((v) => {
        // eslint-disable-next-line max-len
        this._packageParams = Object.assign(this._packageParams, this.decodeParams(v, forceFile, warnError));
      });
    } else {
      // eslint-disable-next-line max-len
      this._packageParams = Object.assign(this._packageParams, this.decodeParams(params, forceFile, warnError));
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

  withNamespace(value) {
    // propagate namespace
    Object.values(this._deployers)
      .filter((deployer) => typeof deployer.withNamespace === 'function')
      .forEach(async (deployer) => {
        deployer.withNamespace(value);
      });
    return this;
  }

  withVersion(value) {
    this._version = value;
    return this;
  }

  withNodeVersion(value) {
    this._nodeVersion = value;
    return this;
  }

  withEntryFile(value) {
    this._file = value;
    return this;
  }

  withPackageShared(value) {
    Object.values(this._deployers)
      .filter((deployer) => typeof deployer.withPackageShared === 'function')
      .forEach(async (deployer) => {
        deployer.withPackageShared(value);
      });
    return this;
  }

  withPackageName(value) {
    this._packageName = value;
    // propagate package name
    Object.values(this._deployers)
      .filter((deployer) => typeof deployer.withPackageName === 'function')
      .forEach(async (deployer) => {
        deployer.withPackageName(value);
      });
    return this;
  }

  withTimeout(value) {
    this._timeout = value;
    return this;
  }

  withConcurrency(value) {
    this._concurrency = value;
    return this;
  }

  withMemory(value) {
    this._memory = value;
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

  withUpdatedBy(value) {
    this._updatedBy = value;
    return this;
  }

  withUpdatedAt(value) {
    this._updatedAt = value;
    return this;
  }

  withAWSRegion(value) {
    // propagate AWS region
    this._deployers.aws.withAWSRegion(value);
    return this;
  }

  withAWSRole(value) {
    // propagate AWS region
    this._deployers.aws.withAWSRole(value);
    return this;
  }

  withAWSApi(value) {
    // propagate AWS api
    this._deployers.aws.withAWSApi(value);
    return this;
  }

  withAzureApp(value) {
    this._deployers.azure.withAzureApp(value);
    return this;
  }

  get testPath() {
    return this._test;
  }

  get packageName() {
    return this._packageName;
  }

  get name() {
    return this._name;
  }

  get actionName() {
    return this._actionName;
  }

  get zipFile() {
    return this._zipFile;
  }

  get nodeVersion() {
    return this._nodeVersion;
  }

  get pkgJson() {
    return this._pkgJson;
  }

  get version() {
    return this._version;
  }

  get dependencies() {
    return this._dependencies;
  }

  get gitUrl() {
    return this._gitUrl;
  }

  get gitOrigin() {
    return this._gitOrigin;
  }

  get gitRef() {
    return this._gitRef;
  }

  get updatedAt() {
    return this._updatedAt;
  }

  get params() {
    return this._params;
  }

  get timeout() {
    return this._timeout;
  }

  get webSecure() {
    return this._webSecure;
  }

  get updatedBy() {
    return this._updatedBy;
  }

  get memory() {
    return this._memory;
  }

  get concurrency() {
    return this._concurrency;
  }

  get showHints() {
    return this._showHints;
  }

  get packageParams() {
    return this._packageParams;
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

    // init deployers
    await Promise.all(Object.values(this._deployers)
      .filter((deployer) => !deployer.ready())
      .filter((deployer) => typeof deployer.init === 'function')
      .map(async (deployer) => deployer.init()));

    this._params = await ActionBuilder.resolveParams(this._params);
    this._packageParams = await ActionBuilder.resolveParams(this._packageParams);

    // init git coordinates
    this._gitUrl = (this._pkgJson.repository || {}).url || '';
    this._gitRef = await getCurrentRevision(this._cwd);
    this._gitOrigin = await getOrigin(this._cwd);

    // init deploy time
    if (!this._updatedAt) {
      this._updatedAt = new Date().getTime();
    }
    if (this._delete) {
      this._deploy = false;
      this._build = false;
      this._showHints = false;
      this._links = [];
    }

    // init deployers
    const targets = { };
    this._target.forEach((t) => {
      if (t === 'auto') {
        // get all deployers that are ready();
        Object.entries(this._deployers).forEach(([name, deployer]) => {
          if (deployer.ready()) {
            targets[name] = deployer;
          }
        });
      } else {
        // deployer must be ready
        const deployer = this._deployers[t];
        if (!deployer) {
          throw Error(`'No such target: ${t}`);
        }
        deployer.validate();
        targets[t] = deployer;
      }
    });
    this._deployers = targets;
    if (Object.keys(targets).length === 0) {
      if (this._deploy || this._test || this._delete || this._updatePackage) {
        throw new Error('No applicable deployers found');
      }
    }
  }

  async createArchive() {
    return new Promise((resolve, reject) => {
      // create zip file for package
      const output = fse.createWriteStream(this._zipFile);
      const archive = archiver('zip');
      this.log.info('--: creating zip file ...');

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
        main: 'index.js',
        license: 'Apache-2.0',
      };

      archive.pipe(output);
      this.updateArchive(archive, packageJson).then(() => {
        archive.finalize();
      });
    });
  }

  async updateArchive(archive, packageJson) {
    archive.file(this._bundle, { name: 'index.js' });
    this._statics.forEach(([src, name]) => {
      if (fse.lstatSync(src).isDirectory()) {
        archive.directory(src, name);
      } else {
        archive.file(src, { name });
      }
    });
    this._modules.forEach((mod) => {
      archive.directory(path.resolve(this._cwd, `node_modules/${mod}`), `node_modules/${mod}`);
    });

    archive.append(JSON.stringify(packageJson, null, '  '), { name: 'package.json' });
    // azure functions manifest
    archive.file(path.resolve(__dirname, 'template', 'function.json'), { name: 'function.json' });
  }

  async getWebpackConfig() {
    return {
      target: 'node',
      mode: 'development',
      // the universal adapter is the entry point
      entry: path.resolve(__dirname, 'template', 'index.js'),
      output: {
        path: this._cwd,
        filename: path.relative(this._cwd, this._bundle),
        library: 'main',
        libraryTarget: 'umd',
      },
      devtool: false,
      externals: [
        ...this._externals,
        // the following are imported by the universal adapter and are assumed to be available
        './params.json',
        'aws-sdk',
      ].reduce((cfg, ext) => {
        // this makes webpack to ignore the module and just leave it as normal require.
        // eslint-disable-next-line no-param-reassign
        cfg[ext] = `commonjs2 ${ext}`;
        return cfg;
      }, {}),
      module: {
        rules: [{
          test: /\.mjs$/,
          type: 'javascript/auto',
        }],
      },
      resolve: {
        mainFields: ['main', 'module'],
        extensions: ['.wasm', '.js', '.mjs', '.json'],
        alias: {
          // the main.js is imported in the universal adapter and is _the_ action entry point
          './main.js': this._file,
        },
      },
      node: {
        __dirname: true,
        __filename: false,
      },
    };
  }

  async createPackage() {
    this.log.info('--: creating bundle ...');
    const config = await this.getWebpackConfig();
    const compiler = webpack(config);
    const stats = await new Promise((resolve, reject) => {
      compiler.run((err, s) => {
        if (err) {
          reject(err);
        } else {
          resolve(s);
        }
      });
    });
    this.log.debug(stats.toString({
      chunks: false,
      colors: true,
    }));

    await this.resolveDependencyInfos(stats);
    this.log.info(chalk`{green ok:} created bundle {yellow ${config.output.filename}}`);
  }

  /**
   * Resolves the dependencies by chunk. eg:
   *
   * {
   *   'src/idx_json.bundle.js': [{
   *      id: '@adobe/helix-epsagon:1.2.0',
   *      name: '@adobe/helix-epsagon',
   *      version: '1.2.0' },
   *   ],
   *   ...
   * }
   */
  async resolveDependencyInfos(stats) {
    // get list of dependencies
    const depsByFile = {};
    const resolved = {};

    const jsonStats = stats.toJson({
      chunks: true,
      chunkModules: true,
    });

    await Promise.all(jsonStats.chunks
      .map(async (chunk) => {
        const chunkName = chunk.names[0];
        const deps = {};
        depsByFile[chunkName] = deps;

        await Promise.all(chunk.modules.map(async (mod) => {
          const segs = mod.identifier.split('/');
          let idx = segs.lastIndexOf('node_modules');
          if (idx >= 0) {
            idx += 1;
            if (segs[idx].charAt(0) === '@') {
              idx += 1;
            }
            segs.splice(idx + 1);
            const dir = path.resolve('/', ...segs);

            try {
              if (!resolved[dir]) {
                const pkgJson = await fse.readJson(path.resolve(dir, 'package.json'));
                const id = `${pkgJson.name}:${pkgJson.version}`;
                resolved[dir] = {
                  id,
                  name: pkgJson.name,
                  version: pkgJson.version,
                };
              }
              const dep = resolved[dir];
              deps[dep.id] = dep;
            } catch (e) {
              // ignore
            }
          }
        }));
      }));

    // sort the deps
    Object.entries(depsByFile)
      .forEach(([scriptFile, deps]) => {
        this._dependencies[scriptFile] = Object.values(deps)
          .sort((d0, d1) => d0.name.localeCompare(d1.name));
      });
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
    this.log.info(chalk`{green ok:} bundle can be loaded and has a {gray main()} function.`);
  }

  async execute(fnName, msg) {
    const deps = Object.values(this._deployers)
      .filter((deployer) => typeof deployer[fnName] === 'function');
    // eslint-disable-next-line no-restricted-syntax
    for (const dep of deps) {
      this.log.info(chalk`--: ${msg}{yellow ${dep.name}} ...`);
      // eslint-disable-next-line no-await-in-loop
      await dep[fnName]();
    }
  }

  async deploy() {
    return this.execute('deploy', 'deploying action to ');
  }

  async updatePackage() {
    return this.execute('updatePackage', 'updating package on ');
  }

  async showDeployHints() {
    return this.execute('showDeployHints', 'hints for ');
  }

  async delete() {
    return this.execute('delete', 'deleting action on ');
  }

  async test() {
    return this.execute('test', 'testing action on ');
  }

  async updateLinks() {
    return this.execute('updateLinks', 'updating links on ');
  }

  async run() {
    this.log.info(chalk`{grey openwhisk-action-builder v${version}}`);
    await this.validate();
    this.log.info(chalk`selected targets: {yellow ${Object.values(this._deployers).map((d) => d.name).join(', ')}}`);

    if (this._build) {
      await this.createPackage();
      await this.createArchive();
      const relZip = path.relative(process.cwd(), this._zipFile);
      this.log.info(chalk`{green ok:} created action: {yellow ${relZip}}.`);
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

    if (this._delete) {
      await this.delete();
    }

    if (typeof this._test === 'string' || Object.keys(this._test_params).length) {
      await this.test();
    }

    await this.updateLinks();

    return Object.entries(this._deployers).reduce((p, [name, dep]) => {
      // eslint-disable-next-line no-param-reassign
      p[name] = {
        name: `${dep.name.toLowerCase()};host=${dep.host}`,
        url: dep.fullFunctionName,
      };
      return p;
    }, {});
  }
};
