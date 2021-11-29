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
const chalk = require('chalk-template');

const BaseConfig = require('./BaseConfig.js');

const OpenWhiskDeployer = require('./deploy/OpenWhiskDeployer');
const AWSDeployer = require('./deploy/AWSDeployer');
const AzureDeployer = require('./deploy/AzureDeployer');
const GoogleDeployer = require('./deploy/GoogleDeployer');
const CloudflareDeployer = require('./deploy/CloudflareDeployer');
const ComputeAtEdgeDeployer = require('./deploy/ComputeAtEdgeDeployer');
const FastlyGateway = require('./gateway/FastlyGateway');

const PLUGINS = [
  OpenWhiskDeployer,
  AWSDeployer,
  AzureDeployer,
  GoogleDeployer,
  CloudflareDeployer,
  ComputeAtEdgeDeployer,
  FastlyGateway,
];

const defaultConfig = require('./config/adobeioruntime-node10.js');

require('dotenv').config();

class CLI {
  constructor() {
    this._yargs = yargs()
      .pkgConf('wsk')
      .env('HLX');
    BaseConfig.yarg(this._yargs);
    PLUGINS.forEach((PluginClass) => PluginClass.Config.yarg(this._yargs));
    this._yargs.help();
  }

  // eslint-disable-next-line class-methods-use-this
  createBuilder() {
    // eslint-disable-next-line global-require
    const ActionBuilder = require('./ActionBuilder.js');
    return new ActionBuilder();
  }

  prepare(args) {
    const argv = this._yargs.parse(args);

    if (argv.externals.length === 0) {
      argv.externals = defaultConfig.externals;
    }

    const config = new BaseConfig().configure(argv);
    const plugins = PLUGINS.map((PluginClass) => {
      const pluginConfig = new PluginClass.Config().configure(argv);
      return new PluginClass(config, pluginConfig);
    });

    return this.createBuilder()
      .withConfig(config)
      .withPlugins(plugins);
  }

  async run(args) {
    try {
      const res = await this.prepare(args).run();
      if (res) {
        console.log(JSON.stringify(res, null, 2));
      }
    } catch (err) {
      console.log(chalk`{red error:} ${err.message}`);
      process.exitCode = 1;
    }
  }
}

module.exports = CLI;
