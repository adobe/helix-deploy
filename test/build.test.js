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

/* eslint-env mocha */
/* eslint-disable no-underscore-dangle */

import assert from 'assert';
import path from 'path';
import yauzl from 'yauzl';
import fse from 'fs-extra';
import { validateBundle } from '../src/utils.js';
import { createTestRoot } from './utils.js';

import CLI from '../src/cli.js';

async function assertZipEntries(zipPath, entries) {
  // check zip
  const result = await new Promise((resolve, reject) => {
    const es = [];
    yauzl.open(zipPath, {
      lazyEntries: true,
      autoClose: true,
    }, (err, zipfile) => {
      if (err) {
        reject(err);
        return;
      }
      zipfile.readEntry();
      zipfile
        .on('entry', (entry) => {
          es.push(entry.fileName);
          zipfile.readEntry();
        })
        .on('close', () => {
          resolve(es);
        })
        .on('error', reject);
    });
  });
  entries.forEach((s) => {
    assert.ok(result.indexOf(s) >= 0, `${s} must be included in ${zipPath}`);
  });
}

const PROJECT_SIMPLE = path.resolve(__rootdir, 'test', 'fixtures', 'simple');
const PROJECT_PURE = path.resolve(__rootdir, 'test', 'fixtures', 'pure-action');
const PROJECT_SIMPLE_ROOTDIR = path.resolve(__rootdir, 'test', 'fixtures', 'simple-rootdir');
const PROJECT_SIMPLE_ESM = path.resolve(__rootdir, 'test', 'fixtures', 'simple-esm');

describe('Build Test', () => {
  let testRoot;
  let origPwd;

  beforeEach(async () => {
    testRoot = await createTestRoot();
    origPwd = process.cwd();
  });

  afterEach(async () => {
    process.chdir(origPwd);
    await fse.remove(testRoot);
  });

  async function generate(buildArgs, testProject = PROJECT_SIMPLE) {
    await fse.copy(testProject, testRoot);
    // need to change .cwd() for yargs to pickup `wsk` in package.json
    process.chdir(testRoot);
    process.env.WSK_AUTH = 'foobar';
    process.env.WSK_NAMESPACE = 'foobar';
    process.env.WSK_APIHOST = 'https://example.com';
    process.env.__OW_ACTION_NAME = '/namespace/package/name@version';
    const builder = new CLI()
      .prepare([
        ...buildArgs,
        '--target', 'wsk',
        '--verbose',
        '--directory', testRoot,
        '--entryFile', 'index.js',
      ]);

    await builder.run();

    await assertZipEntries(path.resolve(testRoot, 'dist', 'simple-package', 'simple-name@1.45.0.zip'), [
      'index.js',
      'package.json',
      'files/hello.txt',
      'morefiles/foo.txt',
      'evenmorefiles/hello.txt',
      'evenmorefiles/world.txt',
    ]);

    // unzip action again
    const zipFile = path.resolve(testRoot, 'dist', 'simple-package', 'simple-name@1.45.0.zip');
    const zipDir = path.resolve(testRoot, 'dist', 'extracted');
    await new Promise((resolve, reject) => {
      yauzl.open(zipFile, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          reject(err);
        }
        zipfile.readEntry();
        zipfile
          .on('end', resolve)
          .on('error', reject)
          .on('entry', (entry) => {
            if (/\/$/.test(entry.fileName)) {
              zipfile.readEntry();
            } else {
              // file entry
              zipfile.openReadStream(entry, (er, readStream) => {
                if (er) {
                  throw err;
                }
                readStream.on('end', () => {
                  zipfile.readEntry();
                });
                const p = path.resolve(zipDir, entry.fileName);
                fse.ensureFileSync(p);
                readStream.pipe(fse.createWriteStream(p));
              });
            }
          });
      });
    });

    // execute main script
    const result = await validateBundle(path.resolve(zipDir, 'index.js'), true);
    assert.strictEqual(result.error, undefined);
    assert.deepEqual(result.response.body, '{"url":"https://localhost/api/v1/web/namespace/package/name@version","file":"Hello, world.\\n"}');
  }

  it('generates the bundle (webpack)', async () => {
    await generate([]);
  }).timeout(15000);

  it('generates the bundle (webpack, esm project)', async () => {
    await generate([], PROJECT_SIMPLE_ESM);
  }).timeout(15000);

  it('generates the bundle (rollup)', async () => {
    await generate(['--bundler', 'rollup'], PROJECT_SIMPLE_ROOTDIR);
  }).timeout(15000);

  it('generates the bundle (rollup, esm-project)', async () => {
    await generate(['--bundler', 'rollup'], PROJECT_SIMPLE_ESM);
  }).timeout(15000);

  it('generates the bundle (esm, webpack) fails', async () => {
    await assert.rejects(generate(['--esm']), Error('Webpack bundler does not support ESM builds.'));
  }).timeout(5000);

  it('rejects unknown bundler', async () => {
    await assert.rejects(generate(['--bundler', 'foobar']), Error('Invalid bundler \'foobar\' for \'node\'. Valid options are: webpack,rollup'));
  }).timeout(5000);

  it('generates the bundle (esm, rollup)', async () => {
    await generate(['--esm', '--bundler', 'rollup'], PROJECT_SIMPLE_ROOTDIR);
  }).timeout(15000);

  it('generates the bundle (esm, rollup, esm project)', async () => {
    await generate(['--esm', '--bundler', 'rollup'], PROJECT_SIMPLE_ESM);
  }).timeout(15000);
});

describe('Edge Build Test', () => {
  let testRoot;
  let origPwd;

  beforeEach(async () => {
    testRoot = await createTestRoot();
    await fse.copy(PROJECT_PURE, testRoot);
    origPwd = process.cwd();
  });

  afterEach(async () => {
    process.chdir(origPwd);
    await fse.remove(testRoot);
  });

  it('generates the bundle', async () => {
    // need to change .cwd() for yargs to pickup `wsk` in package.json
    process.chdir(testRoot);
    process.env.WSK_AUTH = 'foobar';
    process.env.WSK_NAMESPACE = 'foobar';
    process.env.WSK_APIHOST = 'https://example.com';
    process.env.__OW_ACTION_NAME = '/namespace/package/name@version';
    const builder = new CLI()
      .prepare([
        '--target', 'wsk',
        '--arch', 'node',
        '--arch', 'edge', // todo: allow to only generate the edge bundle
        '--verbose',
        '--directory', testRoot,
        '--entryFile', 'index.js',
      ]);

    await builder.run();

    await assertZipEntries(path.resolve(testRoot, 'dist', 'default', 'simple-project.zip'), [
      'index.js',
      'package.json',
    ]);

    // unzip action again
    const zipFile = path.resolve(testRoot, 'dist', 'default', 'simple-project.zip');
    const zipDir = path.resolve(testRoot, 'dist', 'extracted');
    await new Promise((resolve, reject) => {
      yauzl.open(zipFile, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          reject(err);
        }
        zipfile.readEntry();
        zipfile
          .on('end', resolve)
          .on('error', reject)
          .on('entry', (entry) => {
            if (/\/$/.test(entry.fileName)) {
              zipfile.readEntry();
            } else {
              // file entry
              zipfile.openReadStream(entry, (er, readStream) => {
                if (er) {
                  throw err;
                }
                readStream.on('end', () => {
                  zipfile.readEntry();
                });
                const p = path.resolve(zipDir, entry.fileName);
                fse.ensureFileSync(p);
                readStream.pipe(fse.createWriteStream(p));
              });
            }
          });
      });
    });
  })
    .timeout(50000);
});
