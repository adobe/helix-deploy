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
const querystring = require('querystring');
const { Request } = require('@adobe/helix-fetch');
const { epsagon } = require('@adobe/helix-epsagon');
const { isBinary, ensureUTF8Charset } = require('./utils.js');
const getAWSSecrets = require('./aws-package-params.js');
const {
  AWSResolver,
  OpenwhiskResolver,
  GoogleResolver,
  AzureResolver,
} = require('./resolver.js');

// eslint-disable-next-line  import/no-unresolved
const { main } = require('./main.js');

const HEALTHCHECK_PATH = '/_status_check/healthcheck.json';

/*
 * Universal Wrapper for serverless functions
 */

async function getGoogleSecrets(functionName, projectID) {
  const parent = `projects/${projectID}`;
  const package = functionName.replace(/--.*/, '');
  const name = `${parent}/secrets/helix-deploy--${package}/versions/latest`;
  try {
    // delay the import so that other runtimes do not have to care
    // eslint-disable-next-line  import/no-unresolved, global-require
    const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

    // hope that the credentials appear by magic
    const client = new SecretManagerServiceClient();

    const [version] = await client.accessSecretVersion({
      name,
    });

    return JSON.parse(version.payload.data.toString());
  } catch (err) {
    console.error(`Unable to load secrets from ${name}`, err);
    return { };
  }
}

// Azure
async function azure(context, req) {
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
      resolver: new AzureResolver(context, req),
      pathInfo: {
        suffix: `/${req.url.split('/').slice(7).join('/')}`,
      },
      runtime: {
        name: 'azure-functions',
        region: process.env.Location,
      },
      func: {
        name: context.executionContext.functionName,
        version: req.url.split('/')[6],
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
    ensureUTF8Charset(response);

    context.res = {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      isRaw: isBinary(response.headers.get('content-type')),
      body: isBinary(response.headers.get('content-type')) ? Buffer.from(await response.arrayBuffer()) : await response.text(),
    };
  } catch (e) {
    if (e instanceof TypeError && e.code === 'ERR_INVALID_CHAR') {
      // eslint-disable-next-line no-console
      console.error('invalid request header', e.message);
      context.res = {
        status: 400,
        headers: {
          'Content-Type': 'text/plain',
        },
        body: e.message,
      };
      return;
    }
    // eslint-disable-next-line no-console
    console.error('error while invoking function', e);
    context.res = {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        'x-error': e.message,
      },
      body: e.message,
    };
  }
}

// OW
async function openwhiskAdapter(params = {}) {
  try {
    const {
      __ow_method: method = 'GET',
      __ow_headers: headers = {},
      __ow_path: suffix = '',
      __ow_body: rawBody = '',
      __ow_query: query = '',
      ...rest
    } = params;

    let body;
    if (!/^(GET|HEAD)$/i.test(method)) {
      body = isBinary(headers['content-type'])
        ? Buffer.from(rawBody, 'base64')
        : rawBody;
      // binaries and JSON (!) are base64 encoded
      if (/application\/json/.test(headers['content-type'])) {
        body = Buffer.from(rawBody, 'base64').toString('utf-8');
      }
    }

    const env = { ...process.env };
    delete env.__OW_API_KEY;
    let host = env.__OW_API_HOST || 'https://localhost';
    if (typeof headers['x-forwarded-host'] === 'string') {
      host = `https://${headers['x-forwarded-host'].split(',')[0].trim()}`;
    }
    const url = new URL(`${host}/api/v1/web${process.env.__OW_ACTION_NAME}${suffix}`);

    // add query to params
    if (query) {
      Object.entries(querystring.parse(query)).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    // add additional params for actions invoked via wsk
    Object.entries(rest).forEach(([key, value]) => {
      if (key.match(/^[A-Z0-9_]+$/)) {
        env[key] = value;
      } else {
        url.searchParams.append(key, value);
      }
    });
    const request = new Request(url.toString(), {
      method,
      headers,
      body,
    });

    const [namespace, ...names] = (process.env.__OW_ACTION_NAME || 'default/test').split('/');

    const context = {
      resolver: new OpenwhiskResolver(params),
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
      env,
    };

    const response = await main(request, context);
    ensureUTF8Charset(response);

    const isBase64Encoded = isBinary(response.headers.get('content-type'));
    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: isBase64Encoded ? Buffer.from(await response.arrayBuffer()).toString('base64') : await response.text(),
    };
  } catch (e) {
    if (e instanceof TypeError && e.code === 'ERR_INVALID_CHAR') {
      // eslint-disable-next-line no-console
      console.error('invalid request header', e.message);
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'text/plain',
        },
        body: e.message,
      };
    }
    // eslint-disable-next-line no-console
    console.error('error while invoking function', e);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/plain',
        'x-error': e.message,
      },
      body: 'Internal Server Error',
    };
  }
}

function openwhisk(params = {}) {
  let handler = (p) => openwhiskAdapter(p);
  // enable epsagon if not healthcheck path.
  if (params.__ow_path !== HEALTHCHECK_PATH) {
    handler = epsagon(handler);
  }
  return handler(params);
}

// Google
async function google(req, res) {
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
      resolver: new GoogleResolver(req),
      pathInfo: {
        suffix: '', // TODO!
      },
      runtime: {
        name: 'googlecloud-functions',
        region: `${country}-${region}`,
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
      env: {
        ...process.env,
        ...(await getGoogleSecrets(process.env.K_SERVICE, servicename.join('-'))),
      },
    };

    const response = await main(request, context);
    ensureUTF8Charset(response);

    Array.from(response.headers.entries()).reduce((r, [header, value]) => r.set(header, value), res.status(response.status)).send(isBinary(response.headers.get('content-type')) ? Buffer.from(await response.arrayBuffer()) : await response.text());
  } catch (e) {
    if (e instanceof TypeError && e.code === 'ERR_INVALID_CHAR') {
      // eslint-disable-next-line no-console
      console.error('invalid request header', e.message);
      res.status(400).send(e.message);
      return;
    }
    // eslint-disable-next-line no-console
    console.error('error while invoking function', e);
    res
      .status(500)
      .set('x-error', e.message)
      .send(e.message);
  }
}

// AWS
async function lambdaAdapter(event, context, secrets) {
  try {
    const request = new Request(`https://${event.requestContext.domainName}${event.rawPath}${event.rawQueryString ? '?' : ''}${event.rawQueryString}`, {
      method: event.requestContext.http.method,
      headers: event.headers,
      body: event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body,
    });

    // parse ARN
    //   arn:partition:service:region:account-id:resource-type:resource-id
    //   eg: arn:aws:lambda:us-east-1:118435662149:function:dump:4_2_1
    const [/* 'arn' */, /* 'aws' */, /* 'lambda' */,
      region,
      accountId, /* 'function' */,
      functionName,
      functionAlias,
    ] = context.invokedFunctionArn.split(':');

    const con = {
      resolver: new AWSResolver(event),
      pathInfo: {
        suffix: event.pathParameters && event.pathParameters.path ? `/${event.pathParameters.path}` : '',
      },
      runtime: {
        name: 'aws-lambda',
        region,
        accountId,
      },
      func: {
        name: functionName,
        version: (functionAlias || '').replace(/_/g, '.'),
        app: event.requestContext.apiId,
      },
      invocation: {
        id: context.awsRequestId,
        deadline: Date.now() + context.getRemainingTimeInMillis(),
      },
      env: {
        ...process.env,
        ...secrets,
      },
    };

    const response = await main(request, con);
    ensureUTF8Charset(response);

    // flush log if present
    if (con.log && con.log.flush) {
      await con.log.flush();
    }
    const isBase64Encoded = isBinary(response.headers.get('content-type'));
    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      isBase64Encoded,
      body: isBase64Encoded ? Buffer.from(await response.arrayBuffer()).toString('base64') : await response.text(),
    };
  } catch (e) {
    if (e instanceof TypeError && e.code === 'ERR_INVALID_CHAR') {
      // eslint-disable-next-line no-console
      console.error('invalid request header', e.message);
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'text/plain',
        },
        body: e.message,
      };
    }
    // eslint-disable-next-line no-console
    console.error('error while invoking function', e);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/plain',
        'x-error': e.message,
      },
      body: e.message,
    };
  }
}

async function lambda(evt, ctx) {
  try {
    const secrets = await getAWSSecrets(ctx.functionName);
    let handler = (event, context) => lambdaAdapter(event, context, secrets);
    if (secrets.EPSAGON_TOKEN) {
      // check if health check
      const suffix = evt.pathParameters && evt.pathParameters.path ? `/${evt.pathParameters.path}` : '';
      if (suffix !== HEALTHCHECK_PATH) {
        handler = epsagon(handler, {
          token: secrets.EPSAGON_TOKEN,
        });
      }
    }
    return handler(evt, ctx);
  } catch (e) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/plain',
        'x-error': e.message,
      },
      body: e.message,
    };
  }
}

// exports
module.exports = Object.assign(azure, {
  main: openwhisk,
  lambda,
  google,
});
