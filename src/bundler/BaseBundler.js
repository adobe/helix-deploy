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
const chalk = require('chalk');
const archiver = require('archiver');
const semver = require('semver');
const { validateBundle } = require('../utils.js');
const { dependencies } = require('../../package.json');

/**
 * Creates the action bundle
 */
module.exports = class BaseBundler {
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
    });
  }

  withConfig(cfg) {
    this.cfg = cfg;
    return this;
  }

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async init() {
  }

  // eslint-disable-next-line class-methods-use-this
  async createBundle() {
    throw new Error('Unsupported operation');
  }

  async validateBundle() {
    const { cfg } = this;
    cfg.log.info('--: validating bundle ...');
    const result = await validateBundle(cfg.bundle);
    if (result.error) {
      cfg.log.error(chalk`{red error:}`, result.error);
      throw Error(`Validation failed: ${result.error}`);
    }
    cfg.log.info(chalk`{green ok:} bundle can be loaded and has a {gray main()} function.`);
  }

  async createArchive() {
    const { cfg } = this;
    if (!cfg.zipFile) {
      throw Error('zip path is undefined');
    }
    return new Promise((resolve, reject) => {
      // create zip file for package
      const output = fse.createWriteStream(cfg.zipFile);
      const archive = archiver('zip');
      cfg.log.info('--: creating zip file ...');

      let hadErrors = false;
      output.on('close', () => {
        if (!hadErrors) {
          cfg.log.debug(` ${archive.pointer()} total bytes`);
          const relZip = path.relative(process.cwd(), cfg.zipFile);
          cfg.log.info(chalk`{green ok:} created action: {yellow ${relZip}}.`);
          resolve({
            path: cfg.zipFile,
            size: archive.pointer(),
          });
        }
      });
      archive.on('entry', (data) => {
        cfg.log.debug(` - ${data.name}`);
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
        name: cfg.baseName,
        // make sure the version string is valid, so that `npm install` works
        version: semver.valid(cfg.version.replace(/_/g, '.')) ? cfg.version.replace(/_/g, '.') : `0.0.0+${cfg.version}`,
        description: `Universal Action of ${cfg.name}`,
        main: 'index.js',
        type: cfg.esm ? 'module' : 'script',
        license: 'Apache-2.0',
        dependencies: {
          // google cloud installs these dependencies at deploy time
          // all other environments ignore them – this allows us to
          // avoid bundling something that only google needs
          '@google-cloud/secret-manager': dependencies['@google-cloud/secret-manager'],
          '@google-cloud/storage': dependencies['@google-cloud/storage'],
        },
      };
      archive.pipe(output);
      this.updateArchive(archive, packageJson).then(() => {
        archive.finalize();
      }).catch(reject);
    });
  }

  get functionJson() {
    return {
      bindings: [
        {
          authLevel: 'anonymous',
          type: 'httpTrigger',
          direction: 'in',
          name: 'req',
          route: `${this.cfg.packageName}/${this.cfg.name.replace('@', '/')}/{path1?}/{path2?}/{path3?}/{path4?}/{path5?}`,
          methods: [
            'get',
            'post',
            'put',
          ],
        },
        {
          type: 'http',
          direction: 'out',
          name: 'res',
        },
      ],
    };
  }

  async updateArchive(archive, packageJson) {
    const { cfg } = this;
    archive.file(cfg.bundle, { name: 'index.js' });
    cfg.statics.forEach(([src, name]) => {
      try {
        if (fse.lstatSync(src)
          .isDirectory()) {
          archive.directory(src, name);
        } else {
          archive.file(src, { name });
        }
      } catch (e) {
        throw Error(`error with static file: ${e.message}`);
      }
    });
    cfg.modules.forEach((mod) => {
      archive.directory(path.resolve(cfg.cwd, `node_modules/${mod}`), `node_modules/${mod}`);
    });

    archive.append(JSON.stringify(packageJson, null, '  '), { name: 'package.json' });
    // azure functions manifest
    archive.append(JSON.stringify(this.functionJson, null, '  '), { name: 'function.json' });

    // this allows to use a cjs loader for the esm modules. but it still doesn't work on AWS
    if (cfg.esm) {
      archive.directory('esm-adapter');
      archive.append('{}', { name: 'esm-adapter/package.json' });
      archive.file(path.resolve(__dirname, '..', 'template', 'aws-esm-adapter.js'), { name: 'esm-adapter/index.js' });
    }
  }
};
