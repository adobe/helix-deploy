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
/* eslint-disable no-param-reassign, no-underscore-dangle, import/no-extraneous-dependencies */
const { Request } = require('node-fetch');
const { promisify } = require('util');
// eslint-disable-next-line  import/no-unresolved
const { main } = require('./main.js');
/*
 * Universal Wrapper for serverless functions
 */

/**
 * Checks if the content type is binary.
 * @param {string} type - content type
 * @returns {boolean} {@code true} if content type is binary.
 */
function isBinary(type) {
  if (/text\/.*/.test(type)) {
    return false;
  }
  if (/.*\/javascript/.test(type)) {
    return false;
  }
  if (/.*\/.*json/.test(type)) {
    return false;
  }
  if (/.*\/.*xml/.test(type)) {
    return /svg/.test(type); // openwhisk treats SVG as binary
  }
  return true;
}

async function getAWSSecrets(functionName) {
  // delay the import so that other runtimes do not have to care
  // eslint-disable-next-line  import/no-unresolved, global-require
  const AWS = require('aws-sdk');

  AWS.config.update({
    region: process.env.AWS_REGION,
  });

  const ssm = new AWS.SSM();
  ssm.getParametersByPath = promisify(ssm.getParametersByPath.bind(ssm));

  let params = [];
  try {
    const res = await ssm.getParametersByPath({
      Path: `/helix-deploy/${functionName.replace(/--.*/, '')}/`,
      WithDecryption: true,
    });
    params = res.Parameters;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('unable to get parameters', e);
  }

  return params.reduce((p, param) => {
    p[param.Name.replace(/.*\//, '')] = param.Value;
    return p;
  }, {});
}

// Azure
module.exports = async function azure(context, req) {
  context.log('JavaScript HTTP trigger function processed a request.');
  // eslint-disable-next-line global-require, import/no-unresolved
  const params = require('./params.json');

  let body;
  if (!/^(GET|HEAD)$/i.test(req.method)) {
    body = req.headers['content-type'] === 'application/octet-stream' ? req.body : req.rawBody;
  }
  if (req.headers['content-type'] === 'application/octet-stream' && req.headers['x-backup-content-type']) {
    req.headers['content-type'] = req.headers['x-backup-content-type'];
  }

  try {
    const request = new Request(req.url, {
      method: req.method,
      headers: req.headers,
      // azure only detects binaries when the mime type is a/o-s so no image/png or friends
      body,
    });

    const con = {
      pathInfo: {
        suffix: '', // TODO!
      },
      runtime: {
        name: 'azure-functions',
        region: process.env.Location,
      },
      func: {
        name: context.executionContext.functionName,
        version: undefined, // seems impossible to get
        app: process.env.WEBSITE_SITE_NAME,
      },
      invocation: {
        id: context.invocationId,
        deadline: undefined,
      },
      env: {
        ...params,
        ...process.env,
      },
      debug: Object.keys(req),
      types: [typeof req.body, typeof req.rawBody],
      headers: req.headers,
    };

    const response = await main(request, con);

    context.res = {
      status: response.status,
      headers: Array.from(response.headers.entries()).reduce((h, [header, value]) => {
        h[header] = value;
        return h;
      }, {}),
      isRaw: isBinary(response.headers.get('content-type')),
      body: isBinary(response.headers.get('content-type')) ? Buffer.from(await response.arrayBuffer()) : await response.text(),
    };
  } catch (e) {
    context.res = {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
      body: e.message,
    };
  }
};

// OW
module.exports.main = async function openwhisk(params = {}) {
  try {
    let body;
    if (!/^(GET|HEAD)$/i.test(params.__ow_method)) {
      body = params.__ow_headers && isBinary(params.__ow_headers['content-type']) ? Buffer.from(params.__ow_body, 'base64') : params.__ow_body;
    }

    const env = { ...process.env };
    delete env.__OW_API_KEY;
    const request = new Request(`https://${params.__ow_headers && typeof params.__ow_headers['x-forwarded-host'] === 'string' ? params.__ow_headers['x-forwarded-host'].split(',')[0] : 'localhost'}/api/v1/web${process.env.__OW_ACTION_NAME}${params.__ow_path}${params.__ow_query ? '?' : ''}${params.__ow_query}`, {
      method: params.__ow_method,
      headers: params.__ow_headers,
      body,
    });

    const [namespace, ...names] = (process.env.__OW_ACTION_NAME || 'default/test').split('/');
    const suffix = params.__ow_path || '';

    delete params.__ow_method;
    delete params.__ow_query;
    delete params.__ow_body;
    delete params.__ow_headers;
    delete params.__ow_path;

    const context = {
      pathInfo: {
        suffix,
      },
      runtime: {
        name: 'apache-openwhisk',
        region: process.env.__OW_REGION,
      },
      func: {
        name: names.join('/'),
        version: process.env.__OW_ACTION_VERSION,
        app: namespace,
      },
      invocation: {
        id: process.env.__OW_ACTIVATION_ID,
        deadline: Number.parseInt(process.env.__OW_DEADLINE, 10),
      },
      env: { ...params, ...process.env },
    };

    const response = await main(request, context);

    return {
      statusCode: response.status,
      headers: Array.from(response.headers.entries()).reduce((h, [header, value]) => {
        h[header] = value;
        return h;
      }, {}),
      body: isBinary(response.headers.get('content-type')) ? Buffer.from(await response.arrayBuffer()).toString('base64') : await response.text(),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
      body: `${e.message}\n${e.stack}`,
    };
  }
};

// Google
module.exports.google = async (req, res) => {
  try {
    const request = new Request(`https://${req.hostname}/${process.env.K_SERVICE}${req.originalUrl}`, {
      method: req.method,
      headers: req.headers,
      // google magically does the right thing here
      body: req.rawBody,
    });

    const [subdomain] = req.headers.host.split('.');
    const [country, region, ...servicename] = subdomain.split('-');

    const context = {
      pathInfo: {
        suffix: '', // TODO!
      },
      runtime: {
        name: 'googlecloud-functions',
        region: `${country}${region}`,
      },
      func: {
        name: process.env.K_SERVICE,
        version: process.env.K_REVISION,
        app: servicename.join('-'),
      },
      invocation: {
        id: req.headers['function-execution-id'],
        deadline: Number.parseInt(req.headers['x-appengine-timeout-ms'], 10) + Date.now(),
      },
      env: process.env,
    };

    const response = await main(request, context);

    Array.from(response.headers.entries()).reduce((r, [header, value]) => r.set(header, value), res.status(response.status)).send(isBinary(response.headers.get('content-type')) ? Buffer.from(await response.arrayBuffer()) : await response.text());
  } catch (e) {
    res.status(500).send(e.message);
  }
};

// AWS
module.exports.lambda = async function lambda(event, context) {
  try {
    const request = new Request(`https://${event.requestContext.domainName}${event.rawPath}${event.rawQueryString ? '?' : ''}${event.rawQueryString}`, {
      method: event.requestContext.http.method,
      headers: event.headers,
      body: event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body,
    });
    const con = {
      pathInfo: {
        suffix: event.pathParameters && event.pathParameters.path ? `/${event.pathParameters.path}` : '',
      },
      runtime: {
        name: 'aws-lambda',
        region: process.env.AWS_REGION,
      },
      func: {
        name: context.functionName,
        version: context.functionVersion,
        app: event.requestContext.apiId,
      },
      invocation: {
        id: context.awsRequestId,
        deadline: Date.now() + context.getRemainingTimeInMillis(),
      },
      env: {
        ...process.env,
        ...(await getAWSSecrets(context.functionName)),
      },
    };

    const response = await main(request, con);

    return {
      statusCode: response.status,
      headers: Array.from(response.headers.entries()).reduce((h, [header, value]) => {
        h[header] = value;
        return h;
      }, {}),
      isBase64Encoded: isBinary(response.headers.get('content-type')),
      body: isBinary(response.headers.get('content-type')) ? Buffer.from(await response.arrayBuffer()).toString('base64') : await response.text(),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
      body: e.message,
    };
  }
};
