/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
class ComputeAtEdgeConfig {
  constructor() {
    Object.assign(this, {});
  }

  configure(argv) {
    return this
      .withServiceID(argv.computeServiceId)
      .withAuth(argv.fastlyAuth)
      .withCoralogixToken(argv.coralogixToken)
      .withFastlyGateway(argv.fastlyGateway)
      .withComputeDomain(argv.computeTestDomain)
      .withCoralogixApp(argv.computeCoralogixApp);
  }

  withServiceID(value) {
    this.service = value;
    return this;
  }

  withAuth(value) {
    this.auth = value;
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

  withFastlyGateway(value) {
    this.fastlyGateway = value;
    return this;
  }

  withComputeDomain(value) {
    this.testDomain = value;
    return this;
  }

  static yarg(yargs) {
    return yargs
      .group(['compute-service-id', 'compute-domain', 'fastly-auth', 'coralogix-token', 'compute-coralogix-app'], 'Fastly Compute@Edge Options')
      .option('compute-service-id', {
        description: 'the Fastly Service to deploy the action to',
        type: 'string',
        default: '',
      })
      .option('compute-test-domain', {
        description: 'the domain name of the Compute@Edge service (used for testing)',
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
      .option('fastly-gateway', {
        description: 'the hostname of the Fastly gateway for package params',
        type: 'string',
        default: '',
      })
      .option('compute-coralogix-app', {
        description: 'the Application name',
        type: 'string',
        default: 'fastly-compute',
      });
  }
}

module.exports = ComputeAtEdgeConfig;
