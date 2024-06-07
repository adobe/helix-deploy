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
export default class CloudflareConfig {
  constructor() {
    Object.assign(this, {});
  }

  configure(argv) {
    return this
      .withEmail(argv.cloudflareEmail)
      .withAuth(argv.cloudflareAuth)
      .withTestDomain(argv.cloudflareTestDomain)
      .withAccountID(argv.cloudflareAccountId);
  }

  withAccountID(value) {
    this.accountID = value;
    return this;
  }

  withEmail(value) {
    this.email = value;
    return this;
  }

  withTestDomain(value) {
    this.testDomain = value;
    return this;
  }

  withAuth(value) {
    this.auth = value;
    return this;
  }

  static yarg(yargs) {
    return yargs
      .group([
        'cloudflare-account-id',
        'cloudflare-auth',
        'cloudflare-email',
        'cloudflare-test-domain',
      ], 'Cloudflare Workers Deployment Options')
      .option('cloudflare-account-id', {
        description: 'the Cloudflare account ID to deploy to',
        type: 'string',
        default: '',
      })
      .option('cloudflare-email', {
        description: 'the Cloudflare email address belonging to the authentication token',
        type: 'string',
        default: '',
      })
      .option('cloudflare-test-domain', {
        description: 'the *.workers.dev subdomain to use for testing deployed scripts',
        type: 'string',
        default: '',
      })
      .option('cloudflare-auth', {
        description: 'the Cloudflare API token from https://dash.cloudflare.com/profile/api-tokens',
        type: 'string',
        default: '',
      });
  }
}
