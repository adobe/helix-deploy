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
const { promisify } = require('util');

async function getAWSSecrets(functionName) {
  // delay the import so that other runtimes do not have to care
  // eslint-disable-next-line import/no-unresolved, global-require,import/no-extraneous-dependencies
  const AWS = require('aws-sdk');

  AWS.config.update({
    region: process.env.AWS_REGION,
    logger: console,
  });

  const ssm = new AWS.SSM();
  ssm.getParametersByPath = promisify(ssm.getParametersByPath.bind(ssm));

  let params = [];
  let nextToken;
  try {
    do {
      const opts = {
        Path: `/helix-deploy/${functionName.replace(/--.*/, '')}/`,
        WithDecryption: true,
      };
      if (nextToken) {
        opts.NextToken = nextToken;
      }
      // eslint-disable-next-line no-await-in-loop
      const res = await ssm.getParametersByPath(opts);
      nextToken = res.NextToken;
      params = params.concat(res.Parameters);
    } while (nextToken);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('unable to get parameters', e);
  }

  return params.reduce((p, param) => {
    // eslint-disable-next-line no-param-reassign
    p[param.Name.replace(/.*\//, '')] = param.Value;
    return p;
  }, {});
}

module.exports = getAWSSecrets;
