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
import { fileURLToPath } from 'url';
import path from 'path';
import fse from 'fs-extra';
import * as esbuild from 'esbuild';
import chalk from 'chalk-template';

import processQueue from '@adobe/helix-shared-process-queue';

import BaseBundler from './BaseBundler.js';

// eslint-disable-next-line no-underscore-dangle
const __dirname = path.resolve(fileURLToPath(import.meta.url), '..');

/**
 * Webpack based bundler
 */
export default class ESBuildBundler extends BaseBundler {
  /**
   * Create a new bundler.
   *
   * @param {import('../BaseConfig.js')} cfg base config
   */
  constructor(cfg) {
    super(cfg);
    this.arch = 'node';
    this.type = 'esbuild';
  }

  async init() {
    if (!this.cfg.esm) {
      throw new Error('ESBuild bundler only supports ESM builds.');
    }
  }

  async getESBuildConfig() {
    const { cfg } = this;
    /** @type {esbuild.BuildOptions} */
    const opts = {
      format: 'esm',
      platform: 'node',
      bundle: true,
      outfile: path.relative(cfg.cwd, cfg.bundle),
      external: [
        '@aws-sdk/*',
        // the following are imported by the universal adapter and are assumed to be available
        './params.json',
        'aws-sdk',
        '@google-cloud/secret-manager',
        '@google-cloud/storage',
      ],
      banner: {
        js: [
          'import { createRequire } from "module";',
          'const require = createRequire(import.meta.url);',
          '',
        ].join('\n'),
      },
      entryPoints: [
        cfg.adapterFile || path.resolve(__dirname, '..', 'template', 'node-index.mjs'),
      ],
      absWorkingDir: cfg.cwd,
      plugins: [{
        name: 'alias-main',
        setup: (build) => {
          build.onResolve({ filter: /^\.\/main\.js$/ }, () => ({ path: cfg.file }));
          // use @adobe/helix-universal in the calling service, not ours
          build.onResolve(
            { filter: /^@adobe\/helix-universal$/ },
            (args) => ({ path: path.resolve(cfg.cwd, 'node_modules', args.path, 'src', 'index.js') }),
          );
          cfg.externals.forEach((filter) => {
            build.onResolve({ filter }, (args) => ({ path: args.path, external: true }));
          });
          cfg.serverlessExternals.forEach((filter) => {
            build.onResolve({ filter }, (args) => ({ path: args.path, external: true }));
          });
        },
      }],
      metafile: true,
    };
    if (cfg.minify) {
      opts.minify = cfg.minify;
    }

    if (cfg.progressHandler) {
      this.initProgressHandler(opts, cfg);
    }
    return opts;
  }

  async createESBuildBundle(arch) {
    const { cfg } = this;
    if (!cfg.depFile) {
      throw Error('dependencies info path is undefined');
    }
    const m = cfg.minify ? 'minified ' : '';
    if (!cfg.progressHandler) {
      cfg.log.info(`--: creating ${arch} ${m}bundle using esbuild ...`);
    }
    const config = await this.getESBuildConfig();
    const result = await esbuild.build(config);

    await this.resolveDependencyInfos(result.metafile);
    // write dependencies info file
    await fse.writeJson(cfg.depFile, cfg.dependencies, { spaces: 2 });
    if (!cfg.progressHandler) {
      cfg.log.info(chalk`{green ok:} created ${arch} bundle {yellow ${config.outfile}}`);
    }
    return result;
  }

  async createBundle() {
    if (!this.cfg.bundle) {
      throw Error('bundle path is undefined');
    }
    return this.createESBuildBundle('node');
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
  async resolveDependencyInfos(metafile) {
    const { cfg } = this;

    // get list of dependencies
    const resolved = {};
    const deps = {};

    const depNames = [...Object.keys(metafile.inputs)];
    await processQueue(depNames, async (depName) => {
      const absDepPath = path.resolve(cfg.cwd, depName);
      const segs = absDepPath.split('/');
      let idx = segs.lastIndexOf('node_modules');
      if (idx < 0) {
        return;
      }
      if (idx >= 0) {
        idx += 1;
        if (segs[idx].charAt(0) === '@') {
          idx += 1;
        }
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
    });

    // sort the deps
    cfg.dependencies.main = Object.values(deps)
      .sort((d0, d1) => d0.name.localeCompare(d1.name));
  }
}
