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
class FastlyConfig {
  constructor() {
    Object.assign(this, {
      service: null,
      auth: null,
      checkpath: '',
    });
  }

  configure(argv) {
    return this
      .withServiceID(argv.fastlyServiceId)
      .withAuth(argv.fastlyAuth)
      .withCheckpath(argv.checkpath);
  }

  withAuth(value) {
    this.auth = value;
    return this;
  }

  withServiceID(value) {
    this.service = value;
    return this;
  }

  withCheckpath(value) {
    this.checkpath = value;
    return this;
  }

  static yarg(yargs) {
    return yargs
      .group(['fastly-service-id', 'fastly-auth', 'checkpath'], 'Fastly Gateway Options')
      .option('fastly-service-id', {
        description: 'the Fastly Service to use as a gateway',
        type: 'string',
        default: '',
      })
      .option('fastly-auth', {
        description: 'the Fastly token',
        type: 'string',
        default: '',
      })
      .option('checkpath', {
        description: 'the path to check as part of the Fastly health check',
        type: 'string',
        default: '',
      });
  }
}

module.exports = FastlyConfig;
