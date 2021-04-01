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
/* eslint-disable no-console */
// eslint-disable-next-line import/no-unresolved
const AWS = require('aws-sdk');
const { promisify } = require('util');

/**
 * Proxy function that invokes the respective function based on the route parameters.
 *
 * The following routes need to use this function:
 *
 * ANY /helix-services/{action}/{version}
 * ANY /helix-services/{action}/{version}/{path+}
 *
 * ANY /helix-observation/{action}/{version}
 * ANY /helix-observation/{action}/{version}/{path+}
 *
 * Note that the package cannot be a path parameter, as it would clash with the pages proxy
 *
 * @param event
 * @returns {Promise<{body, statusCode}|any>}
 */
exports.handler = async (event) => {
  const lambda = new AWS.Lambda();
  const invoke = promisify(lambda.invoke.bind(lambda));

  const { action, version } = event.pathParameters;
  const [, pkgName] = event.rawPath.split('/');
  const FunctionName = `${pkgName}--${action}:${version.replace(/\./g, '_')}`;

  try {
    console.log(`invoking: ${FunctionName}`);
    const ret = await invoke({
      FunctionName,
      Payload: JSON.stringify(event),
    });
    const data = JSON.parse(ret.Payload);
    console.log(`statusCode: ${data.statusCode}`);
    return data;
  } catch (err) {
    console.error(err);
    return {
      statusCode: err.statusCode,
      body: err.message,
    };
  }
};
