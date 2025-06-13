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
    const builder = await new CLI()
      .prepare([
        ...buildArgs,
        '--target', 'aws',
        '--verbose',
        '--directory', testRoot,
        '--entryFile', 'index.js',
      ]);

    await builder.run();

    const zipPath = path.resolve(testRoot, 'dist', 'simple-package', 'simple-name@1.45.0.zip');
    assert.ok(await fse.exists(zipPath), `Build did not produce zip file: ${zipPath}`);
    await assertZipEntries(zipPath, [
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
    const result = await validateBundle(path.resolve(zipDir, 'index.js'), {
      ...builder.cfg,
      testBundle: true,
    });
    assert.strictEqual(result.error, undefined);
    assert.deepEqual(result.response.body, '{"url":"https://localhost/simple-package/simple-name/1.45.0","file":"Hello, world.\\n"}');
  }

  async function listDependencies(pkg) {
    const indexFile = await fse.readFile(path.resolve(testRoot, 'dist', 'extracted', 'index.js'), { encoding: 'utf-8' });
    const dependencies = indexFile.split('\n')
      .filter((line) => line.startsWith('// ../../../node_modules/'))
      .map((line) => line.substring('// ../../../node_modules/'.length));
    return dependencies.filter((file) => file.startsWith(pkg));
  }

  it('generates the bundle (esbuild)', async () => {
    await generate([], PROJECT_SIMPLE_ESM);

    const dependencies = await listDependencies('@adobe/fetch');
    assert.notStrictEqual(dependencies.length, 0);
  });

  it('generates the bundle (esbuild) with externals', async () => {
    await generate(['--externals', '@adobe/fetch'], PROJECT_SIMPLE_ESM);

    const dependencies = await listDependencies('@adobe/fetch');
    assert.strictEqual(dependencies.length, 0);
  });

  it('generates the bundle (esbuild, no esm) fails', async () => {
    await assert.rejects(generate(['--bundler=esbuild', '--esm=false']), Error('ESBuild bundler only supports ESM builds.'));
  });
});
