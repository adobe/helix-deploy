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

// eslint-disable-next-line no-template-curly-in-string
const DEFAULT_LAMBDA_FORMAT = '${packageName}--${baseName}';

class AWSConfig {
  constructor() {
    Object.assign(this, {
      region: '',
      role: '',
      apiId: '',
      cleanUpBuckets: false,
      cleanUpIntegrations: false,
      createRoutes: false,
      lambdaFormat: DEFAULT_LAMBDA_FORMAT,
      parameterMgr: ['system', 'secret'],
    });
  }

  configure(argv) {
    return this
      .withAWSRegion(argv.awsRegion)
      .withAWSRole(argv.awsRole)
      .withAWSApi(argv.awsApi)
      .withAWSLambdaFormat(argv.awsLambdaFormat)
      .withAWSCleanUpBuckets(argv.awsCleanupBuckets)
      .withAWSCleanUpIntegrations(argv.awsCleanupIntegrations)
      .withAWSCreateRoutes(argv.awsCreateRoutes)
      .withAWSParamsManager(argv.awsParameterManager);
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

  withAWSLambdaFormat(value) {
    this.lambdaFormat = value;
    return this;
  }

  withAWSCleanUpBuckets(value) {
    this.cleanUpBuckets = value;
    return this;
  }

  withAWSCleanUpIntegrations(value) {
    this.cleanUpIntegrations = value;
    return this;
  }

  withAWSCreateRoutes(value) {
    this.createRoutes = value;
    return this;
  }

  withAWSParamsManager(value) {
    this.parameterMgr = value;
    return this;
  }

  static yarg(yargs) {
    return yargs
      .group(['aws-region', 'aws-api', 'aws-role', 'aws-cleanup-buckets', 'aws-cleanup-integrations', 'aws-create-routes'], 'AWS Deployment Options')
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
      .option('aws-create-routes', {
        description: 'Create routes for function (usually not needed due to proxy function).',
        type: 'boolean',
        default: false,
      })
      .option('aws-parameter-manager', {
        description: 'Manager to use for storing package params. (either "secret" for Secrets Manager or "system" for System Manager)',
        type: 'string',
        default: ['secret', 'system'],
        array: true,
      })
      .option('aws-lambda-format', {
        description: 'Format to use to create lambda functions (note that all dots (\'.\') will be replaced with underscores.',
        type: 'string',
        default: DEFAULT_LAMBDA_FORMAT,
      })
      .option('aws-cleanup-buckets', {
        description: 'Cleans up stray temporary S3 buckets',
        type: 'boolean',
        default: false,
      })
      .option('aws-cleanup-integrations', {
        description: 'Cleans up unused integrations',
        type: 'boolean',
        default: false,
      });
  }
}

module.exports = AWSConfig;
