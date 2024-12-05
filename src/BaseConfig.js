/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import crypto from 'crypto';
import path from 'path';
import fse from 'fs-extra';
import chalk from 'chalk-template';
import dotenv from 'dotenv';

// eslint-disable-next-line no-template-curly-in-string
const DEFAULT_ACTION_FORMAT = '/${packageName}/${baseName}/${version}';

function coerceDate(value) {
  try {
    const { duration, unit } = /(?<duration>[0-9]+)(?<unit>s|h|d|w|m|y)?/.exec(value).groups;
    const iduration = Number.parseInt(duration, 10);
    switch (unit) {
      case 's': return iduration; // why would anyone want to specify retention in seconds? For integration tests.
      case 'h': return iduration * 3600;
      case 'd': return iduration * 3600 * 24;
      case 'w': return iduration * 3600 * 24 * 7;
      case 'm': return iduration * 3600 * 24 * 30;
      case 'y': return iduration * 3600 * 24 * 365;
      default: return -value;
    }
  } catch (e) {
    return 0;
  }
}

/**
 * @field name Name of function including the version. eg `my-action@1.2.3`
 * @field baseName Name of the function w/o the version. eg `my-action`
 * @field packageName Name of the function package. eg `my-package`
 */
export default class BaseConfig {
  constructor() {
    Object.assign(this, {
      cwd: process.cwd(),
      distDir: null,
      version: null,
      file: null,
      zipFile: null,
      minify: false,
      bundle: null,
      adapterFile: '',
      env: null,
      verbose: false,
      externals: [],
      edgeExternals: [],
      serverlessExternals: [],
      nodeVersion: null,
      deploy: false,
      test: null,
      testBundle: null,
      testUrl: null,
      testParams: {},
      testHeaders: {},
      statics: [],
      params: {},
      webSecure: false,
      showHints: false,
      modules: [],
      modulePaths: [],
      build: true,
      delete: false,
      updatePackage: false,
      name: null,
      baseName: null,
      packageName: '',
      packageParams: {},
      timeout: 60000,
      concurrency: null,
      memory: null,
      links: [],
      linksPackage: null,
      dependencies: {},
      gitUrl: '',
      gitOrigin: '',
      gitRef: '',
      updatedAt: null,
      updatedBy: null,
      targets: [],
      functionURL: '',
      esm: false,
      archs: ['node', 'edge'],
      bundler: 'webpack',
      format: {
        aws: DEFAULT_ACTION_FORMAT,
      },
      properties: {},
      cleanupCiAge: 0,
      cleanupPatchAge: 0,
      cleanupMinorAge: 0,
      cleanupMajorAge: 0,
      cleanupCiNum: 0,
      cleanupPatchNum: 0,
      cleanupMinorNum: 0,
      cleanupMajorNum: 0,
      _logger: null,
    });
  }

  /**
   * Decoded the params string or file. First as JSON and if this fails, as ENV format.
   * @param {string} params Params string or file name
   * @param {boolean} isFile {@code true} to indicate a file.
   * @param {boolean} warnError {@code true} to only issue warning instead of throwing error
   * @returns {*} Decoded params object.
   */
  decodeParams(params, isFile, warnError) {
    let content = params;
    let { cwd } = this;
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

  configure(argv) {
    return this
      .withVerbose(argv.verbose)
      .withDirectory(argv.directory)
      .withTarget(argv.target)
      .withArch(argv.arch)
      .withBuild(argv.build)
      .withMinify(argv.minify)
      .withESM(argv.esm)
      .withDelete(argv.delete)
      .withDeploy(argv.deploy)
      .withTest(argv.test)
      .withTestBundle(argv.testBundle)
      .withTestParams(argv.testParams)
      .withTestHeaders(argv.testHeaders)
      .withTestUrl(argv.testUrl)
      .withHints(argv.hints)
      .withStatic(argv.static)
      .withName(argv.name)
      .withNamespace(argv.namespace)
      .withUpdatedAt(argv.updatedAt)
      .withUpdatedBy(argv.updatedBy)
      .withParams(argv.params)
      .withParamsFile(argv.paramsFile)
      .withVersion(argv.pkgVersion)
      .withNodeVersion(argv.nodeVersion)
      .withEntryFile(argv.entryFile)
      .withDistDir(argv.distDirectory)
      .withAdapterFile(argv.adapterFile)
      .withExternals(argv.externals)
      .withEdgeExternals(argv.edgeExternals)
      .withServerlessExternals(argv.serverlessExternals)
      .withModules(argv.modules)
      .withWebSecure(argv.webSecure)
      .withUpdatePackage(argv.updatePackage)
      .withPackageName(argv.package.name)
      .withPackageParams(argv.package.params)
      .withPackageParamsFile(argv.package['params-file'])
      .withTimeout(argv.timeout)
      .withMemory(argv.memory)
      .withConcurrency(argv.concurrency)
      .withLinks(argv.versionLink)
      .withLinksPackage(argv.linksPackage)
      .withFormat(argv.format)
      .withCleanupCi(argv.cleanupCi)
      .withCleanupPatch(argv.cleanupPatch)
      .withCleanupMinor(argv.cleanupMinor)
      .withCleanupMajor(argv.cleanupMajor)
      .withPackageToken(argv.packageToken)
      .withProperties(argv.property)
      .withBundler(argv.bundler);
  }

  withVerbose(enable) {
    this.verbose = enable;
    return this;
  }

  withDirectory(value = '.') {
    this.cwd = path.resolve(process.cwd(), value);
    return this;
  }

  withTarget(value) {
    this.targets = [];
    value.forEach((v) => {
      v.split(',').forEach((t) => {
        this.targets.push(t.trim());
      });
    });
    return this;
  }

  withArch(value) {
    this.archs = [];
    value.forEach((v) => {
      v.split(',').forEach((t) => {
        this.archs.push(t.trim());
      });
    });
    return this;
  }

  withDeploy(enable) {
    this.deploy = enable;
    return this;
  }

  withBuild(enable) {
    this.build = enable;
    return this;
  }

  withMinify(enable) {
    this.minify = enable;
    return this;
  }

  withESM(enable) {
    this.esm = enable;
    return this;
  }

  withDelete(enable) {
    this.delete = enable;
    return this;
  }

  withUpdatePackage(enable) {
    this.updatePackage = enable;
    return this;
  }

  withTest(enable) {
    this.test = enable;
    return this;
  }

  withTestBundle(enable) {
    this.testBundle = enable;
    return this;
  }

  withTestUrl(value) {
    this.testUrl = value;
    return this;
  }

  get testPath() {
    if (!this.test.startsWith('/') && this.testUrl) {
      return this.testUrl;
    }
    return this.test;
  }

  withTestParams(params) {
    return this.paramOptionProcessor(params, 'testParams');
  }

  withTestHeaders(headers) {
    return this.paramOptionProcessor(headers, 'testHeaders');
  }

  withHints(showHints) {
    this.showHints = showHints;
    return this;
  }

  withModules(value) {
    this.modules = value;
    return this;
  }

  withWebSecure(value) {
    this.webSecure = value;
    return this;
  }

  withExternals(value) {
    this.externals = (Array.isArray(value) ? value : [value]).map((e) => {
      if (typeof e === 'string' && e.startsWith('/') && e.endsWith('/')) {
        return new RegExp(e.substring(1, e.length - 1));
      }
      return e;
    });
    return this;
  }

  withEdgeExternals(value) {
    this.edgeExternals = (Array.isArray(value) ? value : [value]).map((e) => {
      if (typeof e === 'string' && e.startsWith('/') && e.endsWith('/')) {
        return new RegExp(e.substring(1, e.length - 1));
      }
      return e;
    });
    return this;
  }

  withServerlessExternals(value) {
    this.serverlessExternals = (Array.isArray(value) ? value : [value]).map((e) => {
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
          this.statics.push(v);
        } else {
          this.statics.push([v, v]);
        }
      });
    } else {
      this.statics.push([srcPath, dstRelPath]);
    }
    return this;
  }

  paramOptionProcessor(params, fieldName, forceFile, warnError) {
    if (!params) {
      return this;
    }
    if (Array.isArray(params)) {
      params.forEach((v) => {
        this[fieldName] = Object.assign(
          this[fieldName],
          this.decodeParams(v, forceFile, warnError),
        );
      });
    } else {
      this[fieldName] = Object.assign(
        this[fieldName],
        this.decodeParams(params, forceFile, warnError),
      );
    }
    return this;
  }

  withParams(params, forceFile) {
    return this.paramOptionProcessor(params, 'params', forceFile);
  }

  withPackageParams(params, forceFile) {
    return this.paramOptionProcessor(params, 'packageParams', forceFile, !this.updatePackage);
  }

  withParamsFile(params) {
    return this.withParams(params, true);
  }

  withPackageParamsFile(params) {
    return this.withPackageParams(params, true);
  }

  withName(value) {
    this.name = value;
    return this;
  }

  withNamespace(value) {
    this.namespace = value;
    return this;
  }

  withVersion(value) {
    this.version = value;
    return this;
  }

  withNodeVersion(value) {
    this.nodeVersion = value;
    return this;
  }

  withEntryFile(value) {
    this.file = value;
    return this;
  }

  withAdapterFile(value) {
    this.adapterFile = value;
    return this;
  }

  withBundlePath(value) {
    this.bundle = value;
    return this;
  }

  withDepInfoPath(value) {
    this.depFile = value;
    return this;
  }

  withZipPath(value) {
    this.zipFile = value;
    return this;
  }

  withDistDir(value) {
    this.distDir = path.resolve(process.cwd(), value);
    return this;
  }

  withModulePaths(value) {
    this.modulePaths = value;
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
    this.packageName = value;
    return this;
  }

  withTimeout(value) {
    this.timeout = value;
    return this;
  }

  withConcurrency(value) {
    this.concurrency = value;
    return this;
  }

  withMemory(value) {
    this.memory = value;
    return this;
  }

  withLinks(value) {
    this.links = value || [];
    return this;
  }

  withLinksPackage(value) {
    this.linksPackage = value;
    return this;
  }

  withUpdatedBy(value) {
    this.updatedBy = value;
    return this;
  }

  withUpdatedAt(value) {
    this.updatedAt = value;
    return this;
  }

  withFormat(value) {
    Object.assign(this.format, value || {});
    return this;
  }

  withProperties(value) {
    this.properties = value;
    return this;
  }

  withLogger(logger) {
    this._logger = logger;
    return this;
  }

  withCleanupCi(value) {
    if (value > 0) {
      this.cleanupCiAge = value;
    } else if (value < 0) {
      this.cleanupCiNum = -value;
    }
    return this;
  }

  withCleanupPatch(value) {
    if (value > 0) {
      this.cleanupPatchAge = value;
    } else if (value < 0) {
      this.cleanupPatchNum = -value;
    }
    return this;
  }

  withCleanupMinor(value) {
    if (value > 0) {
      this.cleanupMinorAge = value;
    } else if (value < 0) {
      this.cleanupMinorNum = -value;
    }
    return this;
  }

  withCleanupMajor(value) {
    if (value > 0) {
      this.cleanupMajorAge = value;
    } else if (value < 0) {
      this.cleanupMajorNum = -value;
    }
    return this;
  }

  withPackageToken(value) {
    this.packageToken = value;
    return this;
  }

  withBundler(bundler) {
    if (!bundler) {
      return this;
    }
    this.bundler = bundler;
    return this;
  }

  get log() {
    if (!this._logger) {
      // poor men's logging...
      this._logger = {
        debug: (...args) => {
          if (this.verbose) {
            /* eslint-disable no-console */
            console.error(...args);
          }
        },
        info: console.error,
        warn: console.error,
        error: console.error,
      };
      /* eslint-enable no-console */
    }
    return this._logger;
  }

  static yarg(yargs) {
    return yargs
      .group(['verbose', 'directory', 'version'], 'General Options')
      .option('verbose', {
        alias: 'v',
        type: 'boolean',
        default: false,
      })
      .option('directory', {
        description: 'Project directory',
        type: 'string',
        default: '.',
      })

      .group(['help', 'build', 'deploy', 'test', 'test-bundle', 'update-package', 'version-link', 'delete', 'plugin'], 'Operation Options')
      .option('build', {
        description: 'Build the deployment package',
        type: 'boolean',
        default: true,
      })
      .option('deploy', {
        description: 'Automatically deploy to specified targets',
        type: 'boolean',
        default: false,
      })
      .option('test', {
        description: 'Invoke action after deployment. Can be relative url or "true"',
        type: 'string',
      })
      .option('test-bundle', {
        description: 'Invoke bundle after build. Can be relative url or "true". Defaults to the same as --test',
        type: 'string',
      })
      .option('version-link', {
        alias: 'l',
        description: 'Create symlinks (sequences) after deployment. "major" and "minor" will create respective version links',
        type: 'string',
        array: true,
      })
      .option('delete', {
        description: 'Delete the action from OpenWhisk. Implies no-build',
        type: 'boolean',
        default: false,
      })
      .option('update-package', {
        description: 'Create or update package with params.',
        type: 'boolean',
        default: false,
      })
      .option('plugin', {
        description: 'Specify bundler or deploy plugins.',
        type: 'string',
        array: true,
        default: [],
      })

      .group(['minify', 'static', 'entryFile', 'externals', 'edge-externals', 'serverless-externals', 'modules', 'adapterFile', 'esm', 'bundler', 'dist-directory'], 'Build Options')
      .option('minify', {
        description: 'Minify the final bundle',
        type: 'boolean',
        default: false,
      })
      .option('esm', {
        description: 'Produce EcmaScript Module (experimental, disables edge arch)',
        type: 'boolean',
        default: false,
      })
      .option('modules', {
        alias: 'm',
        description: 'Include a node_module as is.',
        type: 'array',
        default: [],
      })
      .option('static', {
        alias: 's',
        description: 'Includes a static file into the archive',
        type: 'array',
        default: [],
      })
      .option('dist-directory', {
        description: 'Specifies the dist (output) directory',
        default: 'dist',
      })
      .option('entryFile', {
        description: 'Specifies the entry file (the universal function).',
        default: 'src/index.js',
      })
      .option('adapterFile', {
        description: 'Specifies the adapter file (the exported module).',
      })
      .option('externals', {
        description: 'Defines the externals for the bundler (these dependencies will not be bundled).',
        type: 'array',
        default: [],
      })
      .option('edge-externals', {
        description: 'Defines the externals for the edge bundler (these dependencies will not be bundled for Cloudflare or Fastly).',
        type: 'array',
        default: [],
      })
      .option('serverless-externals', {
        description: 'Defines the externals for the serverless bundler (these dependencies will not be bundled for AWS Lambda or Google Cloud Functions).',
        type: 'array',
        default: [],
      })
      .option('arch', {
        description: 'Select archs(s) for bundles (node,edge).',
        type: 'string',
        default: ['node'],
        array: true,
      })

      .group(['target', 'hints'], 'Deploy Options')
      .option('target', {
        description: 'Select target(s) for test, deploy, update-package actions (wsk,aws,google,auto)',
        type: 'string',
        default: ['auto'],
        array: true,
      })
      .option('hints', {
        alias: 'no-hints',
        description: 'Show additional hints for deployment',
        type: 'boolean',
        default: true,
      })

      .group(['target', 'test-params', 'test-url', 'test-headers'], 'Test Options')
      .option('test-params', {
        description: 'Invoke openwhisk action after deployment with the given params.',
        type: 'array',
        default: [],
      })
      .option('test-headers', {
        description: 'Test headers to send in test requests.',
        type: 'array',
        default: [],
      })
      .option('test-url', {
        description: 'Test url to use after deployment, in case --test is not an url.',
        type: 'string',
      })

      .group(['target', 'linkPackage'], 'Link Options')
      .option('linkPackage', {
        description: 'Package name for version links',
        type: 'string',
      })

      .group(['package.params', 'package.params-file'], 'Update Package Options')
      .option('package.params', {
        description: 'OpenWhisk package params.',
        type: 'array',
        default: [],
      })
      .option('package.params-file', {
        description: 'OpenWhisk package params file.',
        type: 'array',
        default: [],
      })
      .option('format', {
        description: 'Action formats',
        type: 'object',
        default: {
          aws: DEFAULT_ACTION_FORMAT,
        },
      })
      .option('property', {
        description: 'Additional properties that can be used in formats.',
        type: 'object',
        default: {},
      })
      .group(
        ['cleanup-ci', 'cleanup-patch', 'cleanup-minor', 'cleanup-major'],
        'Cleanup Old Deployments: automatically delete redundant versions older than specified. \n  Use a pattern like 7d or 1m to specify time frames.\n  Use a simple number like --cleanup-ci=5 to retain the last five CI builds',
      )
      .option('cleanup-ci', {
        description: 'Automatically delete redundant CI versions',
        coerce: coerceDate,
      })
      .option('cleanup-patch', {
        description: 'Automatically delete redundant patch versions. At least one patch version for each minor version will be kept.',
        coerce: coerceDate,
      })
      .option('cleanup-minor', {
        description: 'Automatically delete redundant minor versions. At least one minor version for each major version will be kept.',
        coerce: coerceDate,
      })
      .option('cleanup-major', {
        description: 'Automatically delete redundant major versions.',
        coerce: coerceDate,
      })
      .group([
        'name', 'package.name', 'node-version', 'params', 'params-file', 'updated-by', 'updated-at',
        'web-secure', 'timeout', 'pkgVersion', 'memory', 'concurrency',
      ], 'General Action Options')
      .option('name', {
        description: 'Action name. Can be prefixed with package.',
      })
      .option('pkgVersion', {
        description: 'Version use in the embedded package.json.',
      })
      .option('node-version', {
        description: 'Specifies the node.js version to use in the serverless runtime',
        default: '22',
      })
      .option('web-secure', {
        description: 'Annotates the action with require-whisk-auth. leave empty to generate random token.',
        type: 'string',
        coerce: (value) => {
          if (typeof value === 'string') {
            if (value === 'true') {
              return true;
            }
            if (value === 'false') {
              return false;
            }
            return (value.trim() ? value.trim() : crypto.randomBytes(32).toString('base64'));
          }
          return value;
        },
      })
      .option('package-token', {
        description: 'Protects access to the gateway-stored package parameters with this token. leave empty to generate random token.',
        type: 'string',
        default: crypto.randomBytes(32).toString('base64'),
      })
      .option('params', {
        alias: 'p',
        description: 'Include the given action param. can be json or env.',
        type: 'array',
        default: [],
      })
      .option('params-file', {
        alias: 'f',
        description: 'Include the given action param from a file; can be json or env.',
        type: 'array',
        default: [],
      })
      .option('timeout', {
        alias: 't',
        description: 'the timeout limit in milliseconds after which the action is terminated',
        type: 'integer',
        default: 60000,
      })
      .option('memory', {
        description: 'the maximum memory LIMIT in MB for the action',
        type: 'integer',
      })
      .option('concurrency', {
        description: 'the maximum intra-container concurrent activation LIMIT for the action',
        type: 'integer',
      })
      .option('updated-by', {
        description: 'user that updated the action or sequence.',
        type: 'string',
      })
      .option('updated-at', {
        description: 'unix timestamp when the action or sequence was updated (defaults to the current time).',
        type: 'number',
        default: (new Date().getTime()),
      })
      .option('package.name', {
        description: 'Action package name.',
        type: 'string',
      });
  }
}
