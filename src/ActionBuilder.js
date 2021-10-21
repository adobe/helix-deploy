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
const chalk = require('chalk');
const git = require('isomorphic-git');
const Bundler = require('./Bundler');
const { version } = require('../package.json');
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

  /**
   * Simple string substitute. Replaces all `${key}` occurrences from the given object.
   * @param {string} str string to substitute
   * @param {object} props properties
   */
  static substitute(str, props) {
    return Object.entries(props).reduce((p, [key, value]) => {
      const r = new RegExp(`\\$\\{${key}\\}`, 'g');
      return p.replace(r, value);
    }, str);
  }

  constructor() {
    Object.assign(this, {
      cfg: {},
      _deployers: {},
      _gateways: { },
    });
  }

  withConfig(cfg) {
    this.cfg = cfg;
    return this;
  }

  withPlugins(plugins) {
    plugins.forEach((plg) => {
      if (plg.isDeployer) {
        this._deployers[plg.id] = plg;
      }
      if (plg.isGateway) {
        this._gateways[plg.id] = plg;
      }
    });
    return this;
  }

  async validate() {
    const { cfg } = this;
    try {
      cfg.pkgJson = await fse.readJson(path.resolve(cfg.cwd, 'package.json'));
    } catch (e) {
      cfg.pkgJson = {};
    }
    cfg.file = path.resolve(cfg.cwd, cfg.file || 'index.js');
    if (!cfg.env) {
      cfg.env = path.resolve(cfg.cwd, '.env');
    }
    if (!cfg.distDir) {
      cfg.distDir = path.resolve(cfg.cwd, 'dist');
    }
    if (!cfg.name) {
      cfg.name = cfg.pkgJson.name || path.basename(cfg.cwd);
    }
    if (!cfg.version) {
      cfg.version = cfg.pkgJson.version || '0.0.0';
    }

    // replace action name
    // todo: probably not the best solution anymore. better rely on formats for all deployers
    cfg.name = ActionBuilder.substitute(cfg.name, { ...cfg, ...cfg.properties });

    const segs = cfg.name.split('/');
    cfg.name = segs.pop();
    if (segs.length > 0 && !cfg.packageName) {
      cfg.packageName = segs.pop();
    }
    if (!cfg.packageName) {
      cfg.packageName = 'default';
    }

    const idx = cfg.name.lastIndexOf('@');
    if (idx < 0) {
      cfg.baseName = cfg.name;
    } else {
      cfg.baseName = cfg.name.substring(0, idx);
    }

    if (!cfg.linksPackage) {
      cfg.linksPackage = cfg.packageName;
    }

    if (!cfg.zipFile) {
      cfg.zipFile = path.resolve(cfg.distDir, cfg.packageName, `${cfg.name}.zip`);
    }
    if (!cfg.bundle) {
      const ext = cfg.esm ? '.js' : '.cjs';
      cfg.bundle = path.resolve(cfg.distDir, cfg.packageName, `${cfg.name}-bundle${ext}`);
    }
    if (!cfg.depFile) {
      cfg.depFile = path.resolve(cfg.distDir, cfg.packageName, `${cfg.name}-dependencies.json`);
    }

    // create dist dir
    await fse.ensureDir(cfg.distDir);

    // init deployers
    await Promise.all(Object.values(this._deployers)
      .filter((deployer) => !deployer.ready())
      .filter((deployer) => typeof deployer.init === 'function')
      .map(async (deployer) => deployer.init()));

    cfg.params = await ActionBuilder.resolveParams(cfg.params);
    cfg.packageParams = await ActionBuilder.resolveParams(cfg.packageParams);

    // init git coordinates
    cfg.gitUrl = (cfg.pkgJson.repository || {}).url || '';
    cfg.gitRef = await getCurrentRevision(cfg.cwd);
    cfg.gitOrigin = await getOrigin(cfg.cwd);

    // init deploy time
    if (!cfg.updatedAt) {
      cfg.updatedAt = new Date().getTime();
    }
    if (cfg.delete) {
      cfg.deploy = false;
      cfg.build = false;
      cfg.showHints = false;
      cfg.links = [];
    }
  }

  async validateDeployers() {
    if (this.validated) {
      return;
    }
    const { cfg } = this;
    const targets = { };
    cfg.targets.forEach((t) => {
      if (t === 'auto') {
        // get all deployers that are ready();
        Object.entries(this._deployers).forEach(([name, deployer]) => {
          if (deployer.ready()) {
            deployer.validate();
            targets[name] = deployer;
          }
        });
      } else {
        // deployer must be ready
        const deployer = this._deployers[t];
        if (!deployer) {
          throw Error(`No such target: ${t}`);
        }
        deployer.validate();
        targets[t] = deployer;
      }
    });
    this._deployers = targets;
    if (Object.keys(targets).length === 0) {
      if (cfg.deploy || cfg.test || cfg.delete || cfg.updatePackage) {
        throw new Error('No applicable deployers found');
      }
    }
    cfg.log.info(chalk`--: selected targets: {yellow ${Object.values(this._deployers).map((d) => d.name).join(', ')}}`);
    this.validated = true;
  }

  async execute(fnName, msg, ...args) {
    const { cfg } = this;
    const deps = Object.values(this._deployers)
      .filter((deployer) => typeof deployer[fnName] === 'function');
    const errors = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const dep of deps) {
      if (msg) {
        cfg.log.info(chalk`--: ${msg}{yellow ${dep.name}} ...`);
      }
      try {
        // eslint-disable-next-line no-await-in-loop
        await dep[fnName](...args);
      } catch (e) {
        cfg.log.error(`${chalk.red('error:')} ${dep.name} - ${e.message}`);
        errors.push(e);
      }
    }
    if (errors.length) {
      throw new Error(`aborted due to errors during ${fnName}`);
    }
  }

  async deploy() {
    return this.execute('deploy', 'deploying action to ');
  }

  async updatePackage() {
    return this.execute('updatePackage', 'updating package on ');
  }

  async delete() {
    return this.execute('delete', 'deleting action on ');
  }

  async test() {
    return this.execute('test', 'testing action on ');
  }

  async updateLinks() {
    const { cfg } = this;
    if (cfg.baseName === cfg.name) {
      cfg.log.warn(`${chalk.yellow('warn:')} unable to create version links. unsupported action name format. should be: "name@version"`);
      return false;
    }
    return this.execute('updateLinks', 'updating links on ');
  }

  async runAdditionalTasks() {
    return this.execute('runAdditionalTasks', '');
  }

  async validateAdditionalTasks() {
    return this.execute('validateAdditionalTasks', '');
  }

  async runCleanup() {
    return this.execute('cleanup', '');
  }

  close() {
    if (this.validated) {
      Object.values(this._deployers).forEach((dep) => dep.close());
    }
  }

  async run() {
    try {
      return await this._run();
    } finally {
      this.close();
    }
  }

  async _run() {
    const { cfg } = this;
    cfg.log.info(chalk`{grey universal-action-builder v${version}}`);
    await this.validate();
    await this.validateAdditionalTasks();

    const bundler = new Bundler().withConfig(cfg);
    await bundler.init();

    if (cfg.build) {
      await bundler.createBundle();
      await bundler.createArchive();
      await bundler.validateBundle();
    }

    if (cfg.updatePackage) {
      await this.validateDeployers();
      await this.updatePackage();
    }

    if (cfg.deploy) {
      await this.validateDeployers();
      if (!cfg.build) {
        const relZip = path.relative(process.cwd(), cfg.zipFile);
        cfg.log.info(chalk`{green ok:} using: {yellow ${relZip}}.`);
        cfg.dependencies = await fse.readJson(cfg.depFile);
        await bundler.validateBundle();
      }
      await this.deploy();
    }

    if (cfg.delete) {
      await this.validateDeployers();
      await this.delete();
    }

    if (typeof cfg.test === 'string' || Object.keys(cfg.testParams).length) {
      await this.validateDeployers();
      await this.test();
    }

    if (cfg.links && cfg.links.length) {
      await this.validateDeployers();
      await this.updateLinks();
    }

    if (cfg.cleanupCiAge || cfg.cleanupPatchAge || cfg.cleanupMinorAge || cfg.cleanupMajorAge
      || cfg.cleanupCiNum || cfg.cleanupPatchNum || cfg.cleanupMinorNum || cfg.cleanupMajorNum) {
      await this.runCleanup();
    }

    if (this._gateways.fastly && this._gateways.fastly.ready()) {
      await this.validateDeployers();
      Object.values(this._deployers).forEach((d) => {
        this._gateways.fastly.withDeployer(d);
      });

      this._gateways.fastly.init();
      await this._gateways.fastly.deploy();
    }

    if (this._gateways.fastly
      && this._gateways.fastly.updateable()
      && cfg.links && cfg.links.length) {
      await this.validateDeployers();
      this._gateways.fastly.init();
      await this._gateways.fastly.updateLinks(cfg.links, cfg.version);
    }

    if (cfg.deploy) {
      await this.validateDeployers();
      return Object.entries(this._deployers).reduce((p, [name, dep]) => {
        // eslint-disable-next-line no-param-reassign
        p[name] = {
          name: `${dep.name.toLowerCase()};host=https://${dep.host}`,
          url: dep.fullFunctionName,
        };
        return p;
      }, {});
    }

    await this.runAdditionalTasks();
    return '';
  }
};
