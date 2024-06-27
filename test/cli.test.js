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
import CLI from '../src/cli.js';

describe('CLI Test', () => {
  afterEach(() => {
    delete process.env.HLX_TEST;
    delete process.env.CUSTOM_ENV_VAR;
  });

  it('has correct defaults with no arguments', async () => {
    const builder = await new CLI().prepare();
    assert.equal(builder.cfg.verbose, false);
    assert.equal(builder.cfg.deploy, false);
    assert.deepEqual(builder.cfg.targets, ['auto']);
    assert.deepEqual(builder.cfg.archs, ['node']);
    assert.equal(builder.cfg.build, true);
    assert.equal(builder.cfg.minify, false);
    assert.equal(builder.cfg.esm, false);
    assert.equal(builder.cfg.test, undefined);
    assert.equal(builder.cfg.showHints, true);
    assert.equal(builder.cfg.nodeVersion, '18');
    assert.equal(builder.cfg.docker, null);
    assert.deepEqual(builder.cfg.modules, []);
    assert.equal(JSON.stringify([...builder.cfg.statics])
      .toString(), '[]');
    assert.deepEqual(builder.cfg.params, {});
    assert.equal(builder.cfg.updatePackage, false);
    assert.equal(builder.cfg.webSecure, undefined);
  });

  it('sets verbose flag', async () => {
    const builder = await new CLI()
      .prepare(['-v']);
    assert.equal(builder.cfg.verbose, true);
  });

  it('sets directory argument', async () => {
    const builder = await new CLI()
      .prepare(['--directory', 'foo']);
    assert.equal(builder.cfg.cwd, path.resolve(process.cwd(), 'foo'));
  });

  it('sets dist directory argument', async () => {
    const builder = await new CLI()
      .prepare(['--dist-directory', 'foo']);
    assert.equal(builder.cfg.distDir, path.resolve(process.cwd(), 'foo'));
  });

  it('sets deploy flag', async () => {
    const builder = await new CLI()
      .prepare(['--deploy']);
    assert.deepEqual(builder.cfg.deploy, true);
  });

  it('sets targets', async () => {
    const builder = await new CLI()
      .prepare(['--target=aws', '--target=wsk']);
    assert.deepEqual(builder.cfg.targets, ['aws', 'wsk']);
  });

  it('sets targets with csv', async () => {
    const builder = await new CLI()
      .prepare(['--target=aws,wsk']);
    assert.deepEqual(builder.cfg.targets, ['aws', 'wsk']);
  });

  it('can use HLX env', async () => {
    process.env.HLX_TEST = 'env-test';
    const builder = await new CLI()
      .prepare([]);
    assert.deepEqual(builder.cfg.test, 'env-test');
  });

  it('cli wins over HLX env', async () => {
    process.env.HLX_TEST = 'env-test';
    const builder = await new CLI()
      .prepare(['--test=cli-test']);
    assert.deepEqual(builder.cfg.test, 'cli-test');
  });

  it('important wins', async () => {
    process.env.HLX_TEST = 'env-test';
    const builder = await new CLI()
      .prepare(['--test!important', 'important-test']);

    assert.deepEqual(builder.cfg.test, 'important-test');
  });

  it('sets archs', async () => {
    const builder = await new CLI()
      .prepare(['--arch=node', '--arch=edge']);
    assert.deepEqual(builder.cfg.archs, ['node', 'edge']);
  });

  it('sets archs with csv', async () => {
    const builder = await new CLI()
      .prepare(['--arch=node,edge']);
    assert.deepEqual(builder.cfg.archs, ['node', 'edge']);
  });

  it('clears build flag', async () => {
    const builder = await new CLI()
      .prepare(['--no-build']);
    assert.equal(builder.cfg.build, false);
  });

  it('sets minify flag', async () => {
    const builder = await new CLI()
      .prepare(['--minify']);
    assert.equal(builder.cfg.minify, true);
  });

  it('sets esm flag', async () => {
    const builder = await new CLI()
      .prepare(['--esm']);
    assert.equal(builder.cfg.esm, true);
  });

  it('sets test flag', async () => {
    const builder = await new CLI()
      .prepare(['--test']);
    assert.equal(builder.cfg.test, '');
  });

  it('sets test url', async () => {
    const builder = await new CLI()
      .prepare(['--test', '/ping']);
    assert.equal(builder.cfg.test, '/ping');
  });

  it('sets name', async () => {
    const builder = await new CLI()
      .prepare(['--name', 'foo']);
    assert.equal(builder.cfg.name, 'foo');
  });

  it('sets version', async () => {
    const builder = await new CLI()
      .prepare(['--pkgVersion', '1.2.3']);
    assert.equal(builder.cfg.version, '1.2.3');
  });

  it('sets node version', async () => {
    const builder = await new CLI()
      .prepare(['--node-version', 'foo']);
    assert.equal(builder.cfg.nodeVersion, 'foo');
  });

  it('sets hints', async () => {
    const builder = await new CLI()
      .prepare(['--no-hints']);
    assert.equal(builder.cfg.showHints, false);
  });

  it('sets timeout', async () => {
    const builder = await new CLI()
      .prepare(['--timeout', 10]);
    assert.equal(builder.cfg.timeout, 10);
  });

  it('sets memory', async () => {
    const builder = await new CLI()
      .prepare(['--memory', 10]);
    assert.equal(builder.cfg.memory, 10);
  });

  it('sets concurrency', async () => {
    const builder = await new CLI()
      .prepare(['--concurrency', 10]);
    assert.equal(builder.cfg.concurrency, 10);
  });

  it('sets links', async () => {
    const builder = await new CLI()
      .prepare(['--version-link', 'latest', '-l', 'major']);
    assert.deepEqual(builder.cfg.links, ['latest', 'major']);
  });

  it('sets link package', async () => {
    const builder = await new CLI()
      .prepare(['--linksPackage', 'foo']);
    assert.deepEqual(builder.cfg.linksPackage, 'foo');
  });

  it('sets web-secure', async () => {
    const builder = await new CLI()
      .prepare(['--web-secure']);
    assert.ok(builder.cfg.webSecure);
    assert.ok(typeof builder.cfg.webSecure === 'string');
  });

  it('sets web-secure to token', async () => {
    const builder = await new CLI()
      .prepare(['--web-secure=123']);
    assert.equal(builder.cfg.webSecure, '123');
  });

  it('sets web-secure to true', async () => {
    const builder = await new CLI()
      .prepare(['--web-secure=true']);
    assert.equal(builder.cfg.webSecure, true);
  });

  it('can add statics', async () => {
    const builder = await new CLI()
      .prepare(['-s', 'foo', '-s', 'bar']);
    assert.equal(JSON.stringify([...builder.cfg.statics])
      .toString(), '[["foo","foo"],["bar","bar"]]');
  });

  it('can add params', async () => {
    const builder = await new CLI()
      .prepare(['-p', 'foo=bar']);
    assert.deepEqual(builder.cfg.params, { foo: 'bar' });
  });

  it('can add test params', async () => {
    const builder = await new CLI()
      .prepare(['--test-params', 'foo=bar', '--test-params', 'zoo=42']);
    assert.deepEqual(builder.cfg.testParams, {
      foo: 'bar',
      zoo: 42,
    });
  });

  it('can add test params as json', async () => {
    const builder = await new CLI()
      .prepare(['--test-params', '{ "foo": "bar" }']);
    assert.deepEqual(builder.cfg.testParams, { foo: 'bar' });
  });

  it('can add test headers', async () => {
    const builder = await new CLI()
      .prepare(['--test-headers', 'foo=bar', '--test-headers', 'zoo=42']);
    assert.deepEqual(builder.cfg.testHeaders, {
      foo: 'bar',
      zoo: 42,
    });
  });

  it('can add test headers as json', async () => {
    const builder = await new CLI()
      .prepare(['--test-headers', '{ "foo": "bar" }']);
    assert.deepEqual(builder.cfg.testHeaders, { foo: 'bar' });
  });

  it('can add modules', async () => {
    const builder = await new CLI()
      .prepare(['-m', 'foo', '-m', 'bar']);
    assert.deepEqual(builder.cfg.modules, ['foo', 'bar']);
  });

  it('can add externals with regexp', async () => {
    const builder = await new CLI()
      .prepare(['--externals', '/.*/',
        '--edge-externals', '/node-.*/',
        '--serverless-externals', '/cloudflare-.*/',
      ]);
    assert.deepEqual(builder.cfg.externals, [/.*/]);
    assert.deepEqual(builder.cfg.edgeExternals, [/node-.*/]);
    assert.deepEqual(builder.cfg.serverlessExternals, [/cloudflare-.*/]);
  });

  it('can add params from json file', async () => {
    const file = path.resolve(__rootdir, 'test', 'fixtures', 'test-params.json');
    const builder = await new CLI()
      .prepare(['-f', file]);
    await builder.validate();
    assert.deepEqual(builder.cfg.params, {
      bar: 'Hello, world.',
      foo: 42,
      secrets: {
        key: 'my test key!\n',
      },
    });
  });

  it('can add params from env file', async () => {
    const file = path.resolve(__rootdir, 'test', 'fixtures', 'test-params.env');
    const builder = await new CLI()
      .prepare(['-f', file]);
    assert.deepEqual(builder.cfg.params, {
      bar: 'Hello, world.',
      foo: 42,
    });
  });

  it('can add params from env file with references', async () => {
    const file = path.resolve(__rootdir, 'test', 'fixtures', 'test-params-file.env');
    const builder = await new CLI()
      .prepare(['-f', file]);
    await builder.validate();
    assert.deepEqual(builder.cfg.params, {
      bar: 'Hello, world.',
      foo: '42',
      key: 'my test key!\n',
      nofile: '@foo@',
    });
  });

  it('can add package params from json file', async () => {
    const file = path.resolve(__rootdir, 'test', 'fixtures', 'test-params.json');
    const builder = await new CLI()
      .prepare(['--package.params-file', file]);
    await builder.validate();
    assert.deepEqual(builder.cfg.packageParams, {
      bar: 'Hello, world.',
      foo: 42,
      secrets: {
        key: 'my test key!\n',
      },
    });
  });

  it('can add package params from env file', async () => {
    const file = path.resolve(__rootdir, 'test', 'fixtures', 'test-params.env');
    const builder = await new CLI()
      .prepare(['--package.params-file', file]);
    assert.deepEqual(builder.cfg.packageParams, {
      bar: 'Hello, world.',
      foo: 42,
    });
  });

  it('can add package params throws error if file not found', async () => {
    const file = path.resolve(__rootdir, 'test', 'fixtures', 'test-params1.env');
    await assert.rejects(new CLI().prepare(['--package.params-file', file, '--update-package']));
  });

  it('can add package params shows warn if file not when not updating package', async () => {
    const file = path.resolve(__rootdir, 'test', 'fixtures', 'test-params1.env');
    const builder = await new CLI()
      .prepare(['--package.params-file', file]);
    assert.deepEqual(builder.cfg.packageParams, {});
  });

  it('can add params from env file with references', async () => {
    const file = path.resolve(__rootdir, 'test', 'fixtures', 'test-params-file.env');
    const builder = await new CLI()
      .prepare(['--package.params-file', file]);
    await builder.validate();
    assert.deepEqual(builder.cfg.packageParams, {
      bar: 'Hello, world.',
      foo: '42',
      key: 'my test key!\n',
      nofile: '@foo@',
    });
  });

  it('sets update-package', async () => {
    const builder = await new CLI()
      .prepare(['--update-package']);
    assert.equal(builder.cfg.updatePackage, true);
  });

  it('sets package name', async () => {
    const builder = await new CLI()
      .prepare(['--package.name', 'foo']);
    assert.equal(builder.cfg.packageName, 'foo');
  });

  it('gets package via action name', async () => {
    const builder = await new CLI()
      .prepare(['--name', 'foo/bar']);
    await builder.validate();
    assert.equal(builder.cfg.name, 'bar');
    assert.equal(builder.cfg.packageName, 'foo');
  });

  it('sets cleanup timelines', async () => {
    const builder = await new CLI()
      .prepare(['--cleanup-ci', '24h',
        '--cleanup-patch', '7d',
        '--cleanup-minor', '4w',
        '--cleanup-major', '12m']);
    await builder.validate();
    assert.equal(builder.cfg.cleanupCiAge, 24 * 3600);
    assert.equal(builder.cfg.cleanupPatchAge, 24 * 3600 * 7);
    assert.equal(builder.cfg.cleanupMinorAge, 24 * 3600 * 7 * 4);
    assert.equal(builder.cfg.cleanupMajorAge, 24 * 3600 * 30 * 12);
  });

  it('sets default cleanup timelines', async () => {
    const builder = await new CLI()
      .prepare(['--cleanup-ci', '24h',
        '--cleanup-major', '1y']);
    await builder.validate();
    assert.equal(builder.cfg.cleanupCiAge, 24 * 3600);
    assert.equal(builder.cfg.cleanupPatchAge, 0);
    assert.equal(builder.cfg.cleanupMinorAge, 0);
    assert.equal(builder.cfg.cleanupMajorAge, 24 * 3600 * 365);
  });

  it('sets cleanup counts', async () => {
    const builder = await new CLI()
      .prepare(['--cleanup-ci', '3',
        '--cleanup-patch', '5',
        '--cleanup-minor', '7',
        '--cleanup-major', '11']);
    await builder.validate();
    assert.equal(builder.cfg.cleanupCiNum, 3);
    assert.equal(builder.cfg.cleanupPatchNum, 5);
    assert.equal(builder.cfg.cleanupMinorNum, 7);
    assert.equal(builder.cfg.cleanupMajorNum, 11);
  });

  it('sets default cleanup counts', async () => {
    const builder = await new CLI()
      .prepare(['--cleanup-ci', '24',
        '--cleanup-major', '1']);
    await builder.validate();
    assert.equal(builder.cfg.cleanupCiNum, 24);
    assert.equal(builder.cfg.cleanupPatchNum, 0);
    assert.equal(builder.cfg.cleanupMinorNum, 0);
    assert.equal(builder.cfg.cleanupMajorNum, 1);
  });

  it('sets aws defaults', async () => {
    const builder = await new CLI()
      .prepare([
        '--aws-region', 'us-east-2',
        '--aws-role', 'somerole',
        '--aws-api', 'someapi',
        '--aws-arch', 'arm64',
      ]);
    await builder.validate();
    assert.deepStrictEqual(Object.fromEntries(Object.entries(builder._deployers.aws._cfg)), {
      region: 'us-east-2',
      role: 'somerole',
      apiId: 'someapi',
      arch: 'arm64',
      cleanUpIntegrations: false,
      cleanUpVersions: false,
      createRoutes: false,
      // eslint-disable-next-line no-template-curly-in-string
      lambdaFormat: '${packageName}--${baseName}',
      parameterMgr: ['secret'],
      createAuthorizer: undefined,
      attachAuthorizer: undefined,
      identitySources: ['$request.header.Authorization'],
      deployBucket: '',
      updateSecrets: undefined,
      tracingMode: undefined,
      extraPermissions: undefined,
      layers: undefined,
      logFormat: undefined,
      tags: undefined,
    });
  });

  it('interpolates environment variables', async () => {
    process.env.CUSTOM_ENV_VAR = 'test';
    const builder = await new CLI()
      .prepare([
        '--test',
        // eslint-disable-next-line no-template-curly-in-string
        'some-${env.CUSTOM_ENV_VAR}-value',
        '--serverless-externals',
        // eslint-disable-next-line no-template-curly-in-string
        '/${env.CUSTOM_ENV_VAR}/index.html',
        '--serverless-externals',
        // eslint-disable-next-line no-template-curly-in-string
        '/${env.CUSTOM_ENV_VAR}/index.txt',
      ]);
    assert.deepEqual(builder.cfg.test, 'some-test-value');
    assert.deepEqual(builder.cfg.serverlessExternals, ['/test/index.html', '/test/index.txt']);
  });

  it('ignores non-existing environment variables', async () => {
    const builder = await new CLI()
      // eslint-disable-next-line no-template-curly-in-string
      .prepare(['--test', 'some-${env.CUSTOM_ENV_VAR}-value']);
    // eslint-disable-next-line no-template-curly-in-string
    assert.deepEqual(builder.cfg.test, 'some-${env.CUSTOM_ENV_VAR}-value');
  });
});
