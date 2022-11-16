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

export default class AWSConfig {
  constructor() {
    Object.assign(this, {
      region: '',
      role: '',
      apiId: '',
      cleanUpIntegrations: false,
      createRoutes: false,
      lambdaFormat: DEFAULT_LAMBDA_FORMAT,
      parameterMgr: ['system', 'secret'],
      createAuthorizer: '',
      attachAuthorizer: '',
      arch: 'x86_64',
      identitySources: ['$request.header.Authorization'],
      deployBucket: '',
    });
  }

  configure(argv) {
    return this
      .withAWSRegion(argv.awsRegion)
      .withAWSRole(argv.awsRole)
      .withAWSApi(argv.awsApi)
      .withAWSArch(argv.awsArch)
      .withAWSLambdaFormat(argv.awsLambdaFormat)
      .withAWSCreateAuthorizer(argv.awsCreateAuthorizer)
      .withAWSAttachAuthorizer(argv.awsAttachAuthorizer)
      .withAWSIdentitySources(argv.awsIdentitySource)
      .withAWSCleanUpIntegrations(argv.awsCleanupIntegrations)
      .withAWSCreateRoutes(argv.awsCreateRoutes)
      .withAWSParamsManager(argv.awsParameterManager)
      .withAWSDeployBucket(argv.awsDeployBucket);
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

  withAWSArch(value) {
    if (value !== 'x86_64' && value !== 'arm64') {
      throw new Error('unsupported arch. only x86_64 and arm64 are supported by AWS lambda');
    }
    this.arch = value;
    return this;
  }

  withAWSLambdaFormat(value) {
    this.lambdaFormat = value;
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

  withAWSCreateAuthorizer(value) {
    this.createAuthorizer = value;
    return this;
  }

  withAWSAttachAuthorizer(value) {
    this.attachAuthorizer = value;
    return this;
  }

  withAWSIdentitySources(value) {
    this.identitySources = value;
    return this;
  }

  withAWSDeployBucket(value) {
    this.deployBucket = value;
    return this;
  }

  static yarg(yargs) {
    return yargs
      .group(['aws-region', 'aws-api', 'aws-role', 'aws-cleanup-buckets', 'aws-cleanup-integrations',
        'aws-create-routes', 'aws-create-authorizer', 'aws-attach-authorizer', 'aws-lambda-format',
        'aws-parameter-manager', 'aws-deploy-template', 'aws-arch'], 'AWS Deployment Options')
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
      .option('aws-arch', {
        description: 'deployment architecture. either \'x86_64\' or \'arm64\'',
        type: 'string',
        default: 'x86_64',
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
      .option('aws-create-authorizer', {
        description: 'Creates API Gateway authorizer using lambda authorization with this function and the specified name. '
          + 'The string can contain placeholders (note that all dots (\'.\') are replaced with underscores. '
          // eslint-disable-next-line no-template-curly-in-string
          + 'Example: "helix-authorizer_${version}".',
        type: 'string',
      })
      .option('aws-identity-source', {
        description: 'Identity source to used when creating the authorizer',
        type: 'string',
        array: true,
        default: ['$request.header.Authorization'],
      })
      .option('aws-attach-authorizer', {
        description: 'Attach specified authorizer to routes during linking.',
        type: 'string',
      })
      .option('aws-cleanup-integrations', {
        description: 'Cleans up unused integrations',
        type: 'boolean',
        default: false,
      })
      .option('aws-deploy-bucket', {
        description: 'Name of the deploy S3 bucket to use (default is helix-deploy-bucket-{accountId})',
        type: 'string',
        default: '',
      });
  }
}
