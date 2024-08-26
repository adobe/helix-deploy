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
      cleanUpVersions: false,
      createRoutes: false,
      lambdaFormat: DEFAULT_LAMBDA_FORMAT,
      parameterMgr: ['secret'],
      createAuthorizer: '',
      attachAuthorizer: '',
      arch: 'x86_64',
      identitySources: ['$request.header.Authorization'],
      deployBucket: '',
      updateSecrets: undefined,
      logFormat: undefined,
      layers: undefined,
      tracingMode: undefined,
      extraPermissions: undefined,
      tags: undefined,
      handler: undefined,
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
      .withAWSCleanUpVersions(argv.awsCleanupVersions)
      .withAWSCreateRoutes(argv.awsCreateRoutes)
      .withAWSParamsManager(argv.awsParameterManager)
      .withAWSDeployBucket(argv.awsDeployBucket)
      .withAWSUpdateSecrets(argv.awsUpdateSecrets)
      .withAWSLogFormat(argv.awsLogFormat)
      .withAWSLayers(argv.awsLayers)
      .withAWSTracingMode(argv.awsTracingMode)
      .withAWSExtraPermissions(argv.awsExtraPermissions)
      .withAWSTags(argv.awsTags)
      .withAWSHandler(argv.awsHandler);
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

  withAWSCleanUpVersions(value) {
    this.cleanUpVersions = value;
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

  withAWSUpdateSecrets(value) {
    this.updateSecrets = value;
    return this;
  }

  withAWSLogFormat(value) {
    this.logFormat = value;
    return this;
  }

  withAWSLayers(value) {
    this.layers = value;
    return this;
  }

  withAWSTracingMode(value) {
    this.tracingMode = value;
    return this;
  }

  withAWSExtraPermissions(value) {
    this.extraPermissions = value;
    return this;
  }

  withAWSTags(value) {
    if (value && !Array.isArray(value)) {
      throw new Error('awsTags must be an array');
    }
    this.tags = value;
    return this;
  }

  withAWSHandler(value) {
    this.handler = value;
    return this;
  }

  static yarg(yargs) {
    return yargs
      .group(['aws-region', 'aws-api', 'aws-role', 'aws-cleanup-buckets', 'aws-cleanup-integrations',
        'aws-cleanup-versions', 'aws-create-routes', 'aws-create-authorizer', 'aws-attach-authorizer',
        'aws-lambda-format', 'aws-parameter-manager', 'aws-deploy-template', 'aws-arch', 'aws-update-secrets',
        'aws-deploy-bucket', 'aws-identity-source', 'aws-log-format', 'aws-layers',
        'aws-tracing-mode', 'aws-extra-permissions', 'aws-tags'], 'AWS Deployment Options')
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
        default: ['secret'],
        array: true,
      })
      .option('aws-update-secrets', {
        description: 'Uploads the function specific secrets with the params. defaults to /helix-deploy/{pkg}/{name}',
        type: 'string',
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
      .option('aws-cleanup-versions', {
        description: 'Cleans up unused versions',
        type: 'boolean',
        default: false,
      })
      .option('aws-deploy-bucket', {
        description: 'Name of the deploy S3 bucket to use (default is helix-deploy-bucket-{accountId})',
        type: 'string',
        default: '',
      })
      .option('aws-log-format', {
        description: 'The lambda log format. Can be either "JSON" or "Text".',
        type: 'string',
      })
      .option('aws-layers', {
        description: 'List of layers ARNs to attach to the lambda function.',
        type: 'string',
        array: true,
      })
      .option('aws-tracing-mode', {
        description: 'The lambda tracing mode. Can be either "Active" or "PassThrough".',
        type: 'string',
      })
      .option('aws-extra-permissions', {
        description: 'A list of additional invoke permissions to add to the lambda function in the form <SourceARN>@<Principal>. Optionally, you can use <SourceARN>@<Principal>:<Alias> if you want to scope the permission to a specific alias.',
        type: 'string',
        array: true,
      })
      .option('aws-tags', {
        description: 'A list of additional tags to attach to the lambda function in the form key=value. To remove a tag, use key= (i.e. without a value).',
        type: 'array',
        array: true,
      })
      .option('aws-handler', {
        description: 'Set custom lambda Handler. For example, set if an AWS layer provides another function entry point.',
        type: 'string',
      });
  }
}
