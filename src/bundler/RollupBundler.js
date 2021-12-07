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

import path from 'path';
import fse from 'fs-extra';
import { fileURLToPath } from 'url';
import { rollup } from 'rollup';
import chalk from 'chalk-template';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import pluginJson from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';

import BaseBundler from './BaseBundler.js';

// eslint-disable-next-line no-underscore-dangle
const __dirname = path.resolve(fileURLToPath(import.meta.url), '..');

/**
 * Creates the action bundle using rollup
 */
export default class Bundler extends BaseBundler {
  async getRollupConfig() {
    const { cfg } = this;
    /**
     * @type {import('rollup').RollupOptions}
     */
    const opts = {
      input: cfg.adapterFile || path.resolve(__dirname, '..', 'template', cfg.esm ? 'node-index.mjs' : 'node-index.js'),
      output: {
        file: cfg.bundle,
        name: 'main',
        format: cfg.esm ? 'es' : 'cjs',
        preferConst: true,
        externalLiveBindings: false,
        // inlineDynamicImports: true,
        exports: 'default',
      },
      // shimMissingExports: false,
      treeshake: false,
      external: [
        ...cfg.externals,
        // the following are imported by the universal adapter and are assumed to be available
        './params.json',
        'aws-sdk',
        'fs/promises',
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

    cfg.log.info(`--: creating ${cfg.esm ? 'esm ' : ''}${cfg.minify ? 'minified ' : ''}bundle using rollup...`);
    const config = await this.getRollupConfig();
    const bundle = await rollup(config);

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
      depsByFile[chunk.name] = deps;
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
        // map 'index' to 'main', in order to be compatible with rollup
        if (scriptFile === 'node-index') {
          // eslint-disable-next-line no-param-reassign
          scriptFile = 'main';
        }
        this.cfg.dependencies[scriptFile] = Object.values(deps)
          .sort((d0, d1) => d0.name.localeCompare(d1.name));
      });
  }
}
