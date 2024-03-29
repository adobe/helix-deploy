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
import yargs from 'yargs';
import chalk from 'chalk-template';
import { config as envConfig } from 'dotenv';
import BaseConfig from './BaseConfig.js';
import OpenWhiskDeployer from './deploy/OpenWhiskDeployer.js';
import AWSDeployer from './deploy/AWSDeployer.js';
import GoogleDeployer from './deploy/GoogleDeployer.js';
import CloudflareDeployer from './deploy/CloudflareDeployer.js';
import ComputeAtEdgeDeployer from './deploy/ComputeAtEdgeDeployer.js';
import FastlyGateway from './gateway/FastlyGateway.js';
import ActionBuilder from './ActionBuilder.js';

const PLUGINS = [
  OpenWhiskDeployer,
  AWSDeployer,
  GoogleDeployer,
  CloudflareDeployer,
  ComputeAtEdgeDeployer,
  FastlyGateway,
];

envConfig();

export default class CLI {
  constructor() {
    this._yargs = yargs()
      .pkgConf('wsk')
      .env('HLX')
      .middleware((argv) => {
        // convert process.env to flattened object with flat keys
        // since ActionBuilder.substitute() expects this format.
        const envVars = Object.entries(process.env)
          .reduce((env, [key, value]) => {
            // eslint-disable-next-line no-param-reassign
            env[`env.${key}`] = value;
            return env;
          }, {});

        const substitute = (value) => (typeof value === 'string' ? ActionBuilder.substitute(value, envVars) : value);
        Object.entries(argv).forEach(([key, value]) => {
          if (typeof value === 'string') {
            // eslint-disable-next-line no-param-reassign
            argv[key] = substitute(value, envVars);
          } else if (Array.isArray(value)) {
            // eslint-disable-next-line no-param-reassign
            argv[key] = value.map((v) => substitute(v, envVars));
          }
        });
      });
    BaseConfig.yarg(this._yargs);
    PLUGINS.forEach((PluginClass) => PluginClass.Config.yarg(this._yargs));
    this._yargs
      .wrap(Math.min(120, this._yargs.terminalWidth()))
      .help();
  }

  prepare(args) {
    const argv = this._yargs.parse(args);

    // apply '!important' args (override env).
    Object.entries(argv).forEach(([key, value]) => {
      const idx = key.indexOf('!important');
      if (idx > 0) {
        argv[key.substring(0, idx)] = value;
      }
    });

    if (argv.externals.length === 0) {
      argv.externals = [/^openwhisk(\/.*)?$/];
    }

    const config = new BaseConfig().configure(argv);
    const plugins = PLUGINS.map((PluginClass) => {
      const pluginConfig = new PluginClass.Config().configure(argv);
      return new PluginClass(config, pluginConfig);
    });

    return new ActionBuilder()
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
