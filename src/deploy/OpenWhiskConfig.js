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
/**
 * @field {string} namespace Openwhisk namespace.
 * @field {string} actionName Action as it would be deployed (package + name)
 * @field {boolean} packageShared If package is shared.
 */
class OpenWhiskConfig {
  constructor() {
    Object.assign(this, {
      namespace: '',
      actionName: '',
      packageShared: false,
    });
  }

  configure(argv) {
    return this
      .withNamespace(argv.namespace)
      .withPackageShared(argv.package.shared);
  }

  withNamespace(value) {
    this.namespace = value;
    return this;
  }

  withPackageShared(value) {
    this.packageShared = value;
    return this;
  }

  static yarg(yargs) {
    return yargs
      .group(['namespace', 'package.shared'], 'OpenWhisk Action Options')
      .option('namespace', {
        description: 'OpenWhisk namespace. Needs to match the namespace provided with the openwhisk credentials.',
      })
      .option('package.shared', {
        description: 'OpenWhisk package scope.',
        type: 'boolean',
        default: false,
      });
  }
}

module.exports = OpenWhiskConfig;
