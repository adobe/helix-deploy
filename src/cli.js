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
import ActionBuilder from './ActionBuilder.js';
import WebpackBundler from './bundler/WebpackBundler.js';

const PLUGINS = [
  OpenWhiskDeployer,
  AWSDeployer,
  GoogleDeployer,
  CloudflareDeployer,
  WebpackBundler,
];

envConfig();

async function loadPlugin(name) {
  const names = [
    name,
    `helix-deploy-${name}`,
    `@adobe/helix-deploy-${name}`,
  ];

  let module;
  let moduleName;
  for (const n of names) {
    try {
      // eslint-disable-next-line no-await-in-loop
      module = await import(n);
      moduleName = n;
      break;
    } catch (e) {
      if (e.code !== 'MODULE_NOT_FOUND') {
        throw e;
      }
    }
  }
  if (!module) {
    throw new Error(`Plugin not found: ${name}`);
  }
  const { plugins } = module;
  if (!plugins) {
    throw new Error(`Plugin ${module.name} does not export a plugins' array.`);
  }
  console.log('Loaded plugin:', moduleName);
  for (const clazz of plugins) {
    console.log('- ', clazz.name);
  }
  return plugins;
}

export default class CLI {
  buildArgs(plugins) {
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
    plugins.forEach((PluginClass) => PluginClass.Config?.yarg(this._yargs));
    this._yargs
      .wrap(Math.min(120, this._yargs.terminalWidth()))
      .help();
  }

  async prepare(args) {
    const pluginClasses = [...PLUGINS];
    this.buildArgs(pluginClasses);
    let argv = this._yargs.parse(args);

    // if args specify plugins, load them and parse again
    if (argv.plugin.length) {
      for (const pluginName of argv.plugin) {
        // eslint-disable-next-line no-await-in-loop
        const plugins = await loadPlugin(pluginName);
        pluginClasses.push(...plugins);
      }
      this.buildArgs(pluginClasses);
      argv = this._yargs.parse(args);
    }

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
    const plugins = pluginClasses.map((PluginClass) => {
      const pluginConfig = PluginClass.Config
        ? new PluginClass.Config().configure(argv)
        : null;
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
