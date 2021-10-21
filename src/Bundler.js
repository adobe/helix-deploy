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
const rollup = require('rollup');
const chalk = require('chalk');
const archiver = require('archiver');
const semver = require('semver');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const alias = require('@rollup/plugin-alias');
const pluginJson = require('@rollup/plugin-json');
const { terser } = require('rollup-plugin-terser');

const { dependencies } = require('../package.json');

/**
 * Creates the action bundle
 */
module.exports = class Bundler {
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

  async getRollupConfig() {
    const { cfg } = this;
    /**
     * @type {import('rollup').RollupOptions}
     */
    const opts = {
      // the universal adapter is the entry point
      input: cfg.adapterFile || path.resolve(__dirname, 'template', 'index.js'),
      output: {
        file: cfg.bundle,
        name: 'main',
        format: cfg.esm ? 'es' : 'cjs',
        // inlineDynamicImports: true,
        preferConst: true,
        externalLiveBindings: false,
        exports: 'default',
        // preserveModules: true,
      },
      shimMissingExports: true,
      // treeshake: false,
      external: [
        ...cfg.externals,
        // the following are imported by the universal adapter and are assumed to be available
        './params.json',
        'aws-sdk',
        '@google-cloud/secret-manager',
        '@google-cloud/storage',
        '@google-cloud/functions',
      ],
      plugins: [
        pluginJson({
          preferConst: true,
        }),
        nodeResolve({
          preferBuiltins: true,
        }),
        commonjs({
          ignoreTryCatch: (id) => id !== './main.js',
        }),
        alias({
          entries: [
            { find: './main.js', replacement: cfg.file },
          ],
        }),
      ],
    };
    if (cfg.minify) {
      opts.plugins.push(terser());
    }

    // if (cfg.modulePaths && cfg.modulePaths.length > 0) {
    //   opts.resolve.modules = cfg.modulePaths;
    // }

    return opts;
  }

  async createBundle() {
    const { cfg } = this;
    if (!cfg.bundle) {
      throw Error('bundle path is undefined');
    }
    if (!cfg.depFile) {
      throw Error('dependencies info path is undefined');
    }

    cfg.log.info(`--: creating ${cfg.minify ? 'minified ' : ''}bundle using rollup...`);
    const config = await this.getRollupConfig();
    const bundle = await rollup.rollup(config);

    const { output } = await bundle.generate(config.output);
    await this.resolveDependencyInfos(output);
    await bundle.write(config.output);
    await bundle.close();
    cfg.log.info(chalk`{green ok:} created bundle {yellow ${config.output.file}}`);
    return { };
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
  async resolveDependencyInfos(output) {
    const depsByFile = {};
    const resolved = {};
    await Promise.all(output.filter((chunkOrAsset) => chunkOrAsset.type !== 'asset').map(async (chunk) => {
      const deps = {};
      depsByFile[chunk.fileName] = deps;
      await Promise.all(Object.keys(chunk.modules).map(async (modulePath) => {
        const segs = modulePath.split('/');
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
        this.cfg.dependencies[scriptFile] = Object.values(deps)
          .sort((d0, d1) => d0.name.localeCompare(d1.name));
      });
  }

  async validateBundle() {
    const { cfg } = this;
    cfg.log.info('--: validating bundle ...');
    let module;
    try {
      // eslint-disable-next-line global-require,import/no-dynamic-require
      module = require(cfg.bundle);
    } catch (e) {
      cfg.log.error(chalk`{red error:}`, e);
      throw Error(`Validation failed: ${e}`);
    }
    if (!module.main && typeof module.main !== 'function') {
      throw Error('Validation failed: Action has no main() function.');
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
  }
};
