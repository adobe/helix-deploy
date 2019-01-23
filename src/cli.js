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
      .option('name', {
        description: 'OpenWhisk action name. Can be prefixed with package.',
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
      .option('static', {
        alias: 's',
        description: 'Includes a static file into the archive',
        type: 'array',
        default: [],
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
      .option('kind', {
        description: 'Specifies the action kind. eg: nodejs:10-fat',
        default: 'nodejs:10-fat',
      })
      .option('docker', {
        description: 'Specifies a docker image.',
      })
      .epilogue(this._epiloge())
      .help();
  }

  // eslint-disable-next-line class-methods-use-this
  _epiloge() {
    return 'for more information, find our manual at https://github.com/tripodsan/openwhisk-action-builder';
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
      .withKind(argv.kind)
      .withDocker(argv.docker)
      .withParamsFile(argv.paramsFile);
  }

  async run(args) {
    return this.prepare(args)
      .run()
      .catch(console.error);
  }
}

module.exports = CLI;
