/*
 * Copyright 2018 Adobe. All rights reserved.
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
const ActionBuilder = require('./action_builder.js');

class CLI {
  constructor(noRun) {
    this._noRun = noRun; // this is for testing only.
    this._yargs = yargs
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
        description: 'Show action and github app settings',
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
      .option('github-key', {
        description: 'Specify the GitHub private key file',
      })
      .epilogue('for more information, find our manual at https://github.com/tripodsan/probot-serverless-openwhisk')
      .help();
  }

  run(args) {
    const argv = this._yargs.parse(args);
    const builder = new ActionBuilder()
      .verbose(argv.verbose)
      .withDeploy(argv.deploy)
      .withTest(argv.test)
      .withHints(argv.hints)
      .withStatic(argv.static)
      .withParams(argv.params)
      .withName(argv.name)
      .withParamsFile(argv.paramsFile)
      .withGithubPrivateKey(argv.githubKey);

    if (!this._noRun) {
      builder
        .run()
        .catch(console.error);
    }
    return builder;
  }
}

module.exports = CLI;
