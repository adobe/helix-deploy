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
class GoogleConfig {
  constructor() {
    Object.assign(this, {
      appName: '',
    });
  }

  configure(argv) {
    return this
      .withProjectID(argv.googleProjectId)
      .withKeyFile(argv.googleKeyFile)
      .withRegion(argv.googleRegion)
      .withEmail(argv.googleEmail);
  }

  withProjectID(value) {
    this.projectID = value;
    return this;
  }

  withKeyFile(value) {
    this.keyFile = value;
    return this;
  }

  withEmail(value) {
    this.email = value;
    return this;
  }

  withRegion(value) {
    this.region = value;
    return this;
  }

  static yarg(yargs) {
    return yargs
      .group(['google-project-id', 'google-key-file', 'google-email'], 'Google Deployment Options')
      .option('google-email', {
        description: 'the Google  account email address. Required when using a .pem or .p12 credential file',
        type: 'string',
        default: '',
      })
      .option('google-key-file', {
        description: 'full path to the a .json, .pem, or .p12 key downloaded from the Google Developers Console',
        type: 'string',
        default: '',
      })
      .option('google-project-id', {
        description: 'the Google Cloud project to deploy to. Optional when the key file is a JSON file',
        type: 'string',
        default: '',
      })
      .option('google-region', {
        description: 'the Google Cloud region to deploy in',
        type: 'string',
        default: '',
      });
  }
}

module.exports = GoogleConfig;
