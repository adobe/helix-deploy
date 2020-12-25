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

class AWSConfig {
  constructor() {
    Object.assign(this, {
      region: '',
      role: '',
      apiId: '',
      cleanUpBuckets: false,
    });
  }

  configure(argv) {
    return this
      .withAWSRegion(argv.awsRegion)
      .withAWSRole(argv.awsRole)
      .withAWSApi(argv.awsApi)
      .withAWSCleanUpBuckets(argv.awsCleanupBuckets);
  }

  withAWSRegion(value) {
    this.region = value;
    return this;
  }

  withAWSRole(value) {
    this.role = value;
    return this;
  }

  withAWSApi(value) {
    this.apiId = value;
    return this;
  }

  withAWSCleanUpBuckets(value) {
    this.cleanUpBuckets = value;
    return this;
  }

  static yarg(yargs) {
    return yargs
      .group(['aws-region', 'aws-api', 'aws-role', 'aws-cleanup-buckets'], 'AWS Deployment Options')
      .option('aws-region', {
        description: 'the AWS region to deploy lambda functions to',
        type: 'string',
        default: '',
      })
      .option('aws-role', {
        description: 'the AWS role ARN to execute lambda functions with',
        type: 'string',
        default: '',
      })
      .option('aws-api', {
        description: 'the AWS API Gateway name. (id, "auto" or "create")',
        type: 'string',
        default: 'auto',
      })
      .option('aws-cleanup-buckets', {
        description: 'Cleans up stray temporary S3 buckets',
        type: 'boolean',
        default: false,
      });
  }
}

module.exports = AWSConfig;
