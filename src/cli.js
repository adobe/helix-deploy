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

const yargs = require('yargs');
const chalk = require('chalk');

class CLI {
  constructor() {
    this._yargs = yargs
      .pkgConf('wsk')
      .option('verbose', {
        alias: 'v',
        default: false,
      })
      .option('deploy', {
        description: 'Automatically deploy to OpenWhisk',
        default: false,
      })
      .option('test', {
        description: 'Invoke action after deployment',
        default: false,
      })
      .option('hints', {
        alias: 'no-hints',
        description: 'Show additional hints for deployment',
        default: true,
      })
      .group(['deploy', 'test', 'hints'], 'Operation Options')

      .option('name', {
        description: 'OpenWhisk action name. Can be prefixed with package.',
      })
      .option('pkgVersion', {
        description: 'Version use in the embedded package.json.',
      })
      .option('kind', {
        description: 'Specifies the action kind. eg: nodejs:10-fat',
        default: 'nodejs:10-fat',
      })
      .option('web-export', {
        description: 'Annotates the action as web-action',
        type: 'boolean',
        default: true,
      })
      .option('raw-http', {
        description: 'Annotates the action as raw web-action (enforces web-export=true)',
        type: 'boolean',
        default: false,
      })
      .option('docker', {
        description: 'Specifies a docker image.',
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
      .group(['name', 'kind', 'docker', 'params', 'params-file', 'web-export', 'raw-http'], 'OpenWhisk Action Options')

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
      .group(['static', 'entryFile', 'externals'], 'Bundling Options')
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
    return this.createBuilder()
      .verbose(argv.verbose)
      .withDeploy(argv.deploy)
      .withTest(argv.test)
      .withHints(argv.hints)
      .withStatic(argv.static)
      .withParams(argv.params)
      .withName(argv.name)
      .withVersion(argv.pkgVersion)
      .withKind(argv.kind)
      .withEntryFile(argv.entryFile)
      .withExternals(argv.externals)
      .withDocker(argv.docker)
      .withModules(argv.modules)
      .withWebExport(argv.webExport)
      .withRawHttp(argv.rawHttp)
      .withParamsFile(argv.paramsFile);
  }

  async run(args) {
    try {
      return this.prepare(args).run();
    } catch (err) {
      console.log(`${chalk.redBright('[error] ')} ${err.message}`);
      return -1;
    }
  }
}

module.exports = CLI;
