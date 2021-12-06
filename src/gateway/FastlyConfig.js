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
export default class FastlyConfig {
  constructor() {
    Object.assign(this, {
      service: null,
      auth: null,
      checkpath: '',
      checkinterval: 0,
    });
  }

  configure(argv) {
    return this
      .withServiceID(argv.fastlyServiceId)
      .withAuth(argv.fastlyAuth)
      .withCoralogixToken(argv.coralogixToken)
      .withCoralogixApp(argv.coralogixApp)
      .withCheckInterval(argv.checkInterval)
      .withCheckpath(argv.checkpath);
  }

  withAuth(value) {
    this.auth = value;
    return this;
  }

  withCheckInterval(value) {
    this.checkinterval = value;
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

  withCoralogixToken(value) {
    this.coralogixToken = value;
    return this;
  }

  withCoralogixApp(value) {
    this.coralogixApp = value;
    return this;
  }

  static yarg(yargs) {
    return yargs
      .group(['fastly-service-id', 'fastly-auth', 'checkpath', 'coralogix-token', 'coralogix-app'], 'Fastly Gateway Options')
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
      .option('coralogix-token', {
        description: 'the Coralogix token (to enable logging)',
        type: 'string',
        default: '',
      })
      .option('coralogix-app', {
        description: 'the Application name',
        type: 'string',
        default: 'universal-runtime',
      })
      .option('checkpath', {
        description: 'the path to check as part of the Fastly health check',
        type: 'string',
        default: '',
      })
      .option('checkinterval', {
        description: 'the interval in milliseconds that each Fastly POP should perform a health check. Set to 0 to disable health checks entirely.',
        type: 'number',
        default: 6000000,
      });
  }
}
