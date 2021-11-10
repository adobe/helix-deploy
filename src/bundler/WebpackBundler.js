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
const webpack = require('webpack');
const chalk = require('chalk');
const BaseBundler = require('./BaseBundler.js');

/**
 * Creates the action bundle
 */
module.exports = class WebpackBundler extends BaseBundler {
  async init() {
    if (this.cfg.esm) {
      throw new Error('Webpack bundler does not support ESM builds.');
    }
  }

  async getWebpackConfig() {
    const { cfg } = this;
    const opts = {
      target: 'node',
      mode: 'development',
      // the universal adapter is the entry point
      entry: cfg.adapterFile || path.resolve(__dirname, '..', 'template', 'index.js'),
      output: {
        path: cfg.cwd,
        filename: path.relative(cfg.cwd, cfg.bundle),
        library: 'main',
        libraryTarget: 'umd',
      },
      devtool: false,
      externals: [
        ...cfg.externals,
        // the following are imported by the universal adapter and are assumed to be available
        './params.json',
        'aws-sdk',
        '@google-cloud/secret-manager',
        '@google-cloud/storage',
      ].reduce((obj, ext) => {
        // this makes webpack to ignore the module and just leave it as normal require.
        // eslint-disable-next-line no-param-reassign
        obj[ext] = `commonjs2 ${ext}`;
        return obj;
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
          './main.js': cfg.file,
        },
      },
      node: {
        __dirname: true,
        __filename: false,
      },
      plugins: [],
    };
    if (cfg.minify) {
      opts.optimization = {
        minimize: cfg.minify,
      };
    }
    if (cfg.modulePaths && cfg.modulePaths.length > 0) {
      opts.resolve.modules = cfg.modulePaths;
    }

    if (cfg.progressHandler) {
      opts.plugins.push(new webpack.ProgressPlugin(cfg.progressHandler));
    }
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
    const m = cfg.minify ? 'minified ' : '';
    if (!cfg.progressHandler) {
      cfg.log.info(`--: creating ${m}bundle using webpack ...`);
    }
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
    cfg.log.debug(stats.toString({
      chunks: false,
      colors: true,
    }));

    await this.resolveDependencyInfos(stats);
    // write dependencies info file
    await fse.writeJson(cfg.depFile, cfg.dependencies, { spaces: 2 });
    if (!cfg.progressHandler) {
      cfg.log.info(chalk`{green ok:} created bundle {yellow ${config.output.filename}}`);
    }
    return stats;
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
    const { cfg } = this;

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
        cfg.dependencies[scriptFile] = Object.values(deps)
          .sort((d0, d1) => d0.name.localeCompare(d1.name));
      });
  }
};
