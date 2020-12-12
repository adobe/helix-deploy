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

/* eslint-disable no-console */
const crypto = require('crypto');
const yargs = require('yargs');
const chalk = require('chalk');

const defaultConfig = require('./config/adobeioruntime-node10.js');

class CLI {
  constructor() {
    this._yargs = yargs()
      .pkgConf('wsk')
      .option('verbose', {
        alias: 'v',
        type: 'boolean',
        default: false,
      })
      .option('build', {
        description: 'Build the deployment package',
        type: 'boolean',
        default: true,
      })
      .option('directory', {
        description: 'Project directory',
        type: 'string',
        default: '.',
      })
      .option('deploy', {
        description: 'Automatically deploy to specified targets (wsk,aws,azure,google,all)',
        type: 'string',
        array: true,
      })
      .option('test', {
        description: 'Invoke action after deployment. Can be relative url.',
        type: 'string',
      })
      .option('test-params', {
        description: 'Invoke openwhisk action after deployment with the given params.',
        type: 'array',
        default: [],
      })
      .option('hints', {
        alias: 'no-hints',
        description: 'Show additional hints for deployment',
        type: 'boolean',
        default: true,
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
      .option('linkPackage', {
        description: 'Package name for version links',
        type: 'string',
      })
      .group(['build', 'deploy', 'test', 'test-params', 'hints', 'update-package', 'version-link', 'linkPackage', 'delete'], 'Operation Options')

      .option('name', {
        description: 'OpenWhisk action name. Can be prefixed with package.',
      })
      .option('namespace', {
        description: 'OpenWhisk namespace. Needs to match the namespace provided with the openwhisk credentials.',
      })
      .option('pkgVersion', {
        description: 'Version use in the embedded package.json.',
      })
      .option('node-version', {
        description: 'Specifies the node.js version to use in the serverless runtime',
        default: '10',
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
      .option('params', {
        alias: 'p',
        description: 'Include the given action param. can be json or env.',
        type: 'array',
        default: [],
      })
      .option('modules', {
        alias: 'm',
        description: 'Include a node_module as is.',
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
      .group(['aws-region', 'aws-role'], 'AWS Deployment Options')
      .option('aws-region', {
        description: 'the AWS region to deploy lambda functions to',
        type: 'string',
        default: '',
      })
      .option('aws-role', {
        description: 'the AWS role ARN to execute lambda functions with',
        type: 'string',
        default: '',
      })
      .option('aws-api', {
        description: 'the AWS API Gateway name. (id, "auto" or "create")',
        type: 'string',
        default: 'auto',
      })
      .option('azure-app', {
        description: 'the Azure function app to deploy to',
        type: 'string',
        default: '',
      })
      .group([
        'name', 'node-version', 'params', 'params-file', 'updated-by', 'updated-at'], 'General Action Options')
      .group([
        'web-secure', 'namespace', 'timeout'], 'OpenWhisk Action Options')

      .option('update-package', {
        description: 'Create or update wsk package.',
        type: 'boolean',
        default: false,
      })
      .option('package.name', {
        description: 'OpenWhisk package name.',
        type: 'string',
      })
      .option('package.shared', {
        description: 'OpenWhisk package scope.',
        type: 'boolean',
        default: false,
      })
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
      .group(['package.name', 'package.params', 'package.params-file', 'package.shared'], 'OpenWhisk Package Options')

      .option('static', {
        alias: 's',
        description: 'Includes a static file into the archive',
        type: 'array',
        default: [],
      })
      .option('entryFile', {
        description: 'Specifies the entry file.',
        default: 'src/index.js',
      })
      .option('externals', {
        description: 'Defines the externals for webpack.',
        type: 'array',
        default: [],
      })
      .group(['static', 'entryFile', 'externals', 'modules'], 'Bundling Options')
      .help();
  }

  // eslint-disable-next-line class-methods-use-this
  createBuilder() {
    // eslint-disable-next-line global-require
    const ActionBuilder = require('./action_builder.js');
    return new ActionBuilder();
  }

  prepare(args) {
    const argv = this._yargs.parse(args);

    if (argv.externals.length === 0) {
      argv.externals = defaultConfig.externals;
    }
    return this.createBuilder()
      .verbose(argv.verbose)
      .withDirectory(argv.directory)
      .withBuild(argv.build)
      .withDelete(argv.delete)
      .withDeploy(argv.deploy)
      .withTest(argv.test)
      .withTestParams(argv.testParams)
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
      .withExternals(argv.externals)
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
      .withAWSRegion(argv.awsRegion)
      .withAWSRole(argv.awsRole)
      .withAWSApi(argv.awsApi)
      .withAzureApp(argv.azureApp)
      .withPackageShared(argv.package.shared);
  }

  async run(args) {
    try {
      const res = await this.prepare(args).run();
      console.log(JSON.stringify(res, null, 2));
    } catch (err) {
      console.log(`${chalk.red('error:')} ${err.message}`);
      process.exitCode = 1;
    }
  }
}

module.exports = CLI;
