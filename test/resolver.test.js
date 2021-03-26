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

/* eslint-env mocha */
/* eslint-disable no-underscore-dangle */

const assert = require('assert');
const {
  Resolver,
  AWSResolver,
  OpenwhiskResolver,
  GoogleResolver,
  AzureResolver,
} = require('../src/template/resolver.js');

describe('Resolver Tests', () => {
  it('accepts missing headers options', async () => {
    const resolver = new Resolver();
    assert.equal(
      resolver.createURL({ package: 'bar', name: 'foo', version: 'v1' }).href,
      'urn:/bar/foo/v1',
    );
  });

  it('accepts missing lock header options', async () => {
    const resolver = new Resolver({
      host: 'foo.com',
    });
    assert.equal(
      resolver.createURL({ package: 'bar', name: 'foo', version: 'v1' }).href,
      'urn:/bar/foo/v1',
    );
  });

  it('accepts empty lock header options', async () => {
    const resolver = new Resolver({
      host: 'foo.com',
      'x-ow-version-lock': '',
    });
    assert.equal(
      resolver.createURL({ package: 'bar', name: 'foo', version: 'v1' }).href,
      'urn:/bar/foo/v1',
    );
  });

  it('can handle single lock', async () => {
    const resolver = new Resolver({
      host: 'foo.com',
      'x-ow-version-lock': 'foo=v2',
    });
    assert.equal(
      resolver.createURL({ package: 'bar', name: 'foo', version: 'v1' }).href,
      'urn:/bar/foo/v2',
    );
  });

  it('can handle multi locks', async () => {
    const resolver = new Resolver({
      host: 'foo.com',
      'x-ow-version-lock': 'foo=v2&simple=1.2.3',
    });
    assert.equal(
      resolver.createURL({ package: 'bar', name: 'foo', version: 'v1' }).href,
      'urn:/bar/foo/v2',
    );
    assert.equal(
      resolver.createURL({ package: 'bar', name: 'simple', version: 'v1' }).href,
      'urn:/bar/simple/1.2.3',
    );
  });

  it('can create url with no package', async () => {
    const resolver = new Resolver({
      host: 'foo.com',
      'x-ow-version-lock': 'foo=v2',
    });
    assert.equal(
      resolver.createURL({ name: 'foo', version: 'v1' }).href,
      'urn:/foo/v2',
    );
  });

  it('requires name', async () => {
    const resolver = new Resolver({});
    assert.throws(() => resolver.createURL({ version: 'v1' }), new Error('action name missing.'));
  });

  it('can create url with no version', async () => {
    const resolver = new Resolver({
      host: 'foo.com',
    });
    assert.equal(
      resolver.createURL({ package: 'bar', name: 'foo' }).href,
      'urn:/bar/foo',
    );
  });
});

describe('Openwhisk Resolver Tests', () => {
  beforeEach(() => {
    process.env.__OW_NAMESPACE = 'test-namespace';
    process.env.__OW_API_HOST = 'https://adobeioruntime.net';
  });

  afterEach(() => {
    delete process.env.__OW_NAMESPACE;
  });

  it('can handle single lock', async () => {
    const resolver = new OpenwhiskResolver({
      __ow_headers: {
        host: 'foo.com',
        'x-ow-version-lock': 'foo=v2',
      },
    });
    assert.equal(
      resolver.createURL({ package: 'bar', name: 'foo', version: 'v1' }).href,
      'https://adobeioruntime.net/api/v1/web/test-namespace/bar/foo@v2',
    );
  });

  it('create url honors api host from environment', async () => {
    process.env.__OW_API_HOST = 'https://test.apihost.com';
    const resolver = new OpenwhiskResolver({
      __ow_headers: {
        host: 'foo.com',
        'x-ow-version-lock': 'foo=v2',
      },
    });
    assert.equal(
      resolver.createURL({ name: 'foo', version: 'v1' }).href,
      'https://test.apihost.com/api/v1/web/test-namespace/foo@v2',
    );
  });

  it('can create url with no version', async () => {
    const resolver = new OpenwhiskResolver({});
    assert.equal(
      resolver.createURL({ package: 'bar', name: 'foo' }).href,
      'https://adobeioruntime.net/api/v1/web/test-namespace/bar/foo',
    );
  });
});

describe('AWS Resolver Tests', () => {
  it('can handle single lock', async () => {
    const resolver = new AWSResolver({
      headers: {
        host: 'foo.com',
        'x-ow-version-lock': 'foo=v2',
      },
      requestContext: {
        domainName: 'abc.execute-api.us-east-1.amazonaws.com',
      },
    });
    assert.equal(
      resolver.createURL({ package: 'bar', name: 'foo', version: 'v1' }).href,
      'https://abc.execute-api.us-east-1.amazonaws.com/bar/foo/v2',
    );
  });

  it('can create url with no version', async () => {
    const resolver = new AWSResolver({
      headers: {
        host: 'foo.com',
      },
      requestContext: {
        domainName: 'abc.execute-api.us-east-1.amazonaws.com',
      },
    });
    assert.equal(
      resolver.createURL({ package: 'bar', name: 'foo' }).href,
      'https://abc.execute-api.us-east-1.amazonaws.com/bar/foo',
    );
  });
});

describe('Azure Resolver Tests', () => {
  it('can handle single lock', async () => {
    const resolver = new AzureResolver({}, {
      headers: {
        host: 'foo.com',
        'x-ow-version-lock': 'foo=v2',
      },
    });
    assert.equal(
      resolver.createURL({ package: 'bar', name: 'foo', version: 'v1' }).href,
      'azure:/bar/foo/v2',
    );
  });

  it('can create url with no version', async () => {
    const resolver = new AzureResolver({}, {
      headers: {
        host: 'foo.com',
      },
    });
    assert.equal(
      resolver.createURL({ package: 'bar', name: 'foo' }).href,
      'azure:/bar/foo',
    );
  });
});

describe('Google Resolver Tests', () => {
  it('can handle single lock', async () => {
    const resolver = new GoogleResolver({
      hostname: 'us-central1-helix-225321.cloudfunctions.net',
      get: () => '',
      headers: {
        'x-ow-version-lock': 'foo=v2',
      },
    });
    assert.equal(
      resolver.createURL({ package: 'bar', name: 'foo', version: 'v1' }).href,
      'https://us-central1-helix-225321.cloudfunctions.net/bar--foo_v2',
    );
  });

  it('can create url with no version', async () => {
    const resolver = new GoogleResolver({
      hostname: 'us-central1-helix-225321.cloudfunctions.net',
      get: () => '',
      headers: {
        host: 'foo.com',
      },
    });
    assert.equal(
      resolver.createURL({ package: 'bar', name: 'foo' }).href,
      'https://us-central1-helix-225321.cloudfunctions.net/bar--foo',
    );
  });
});

describe('Google Resolver Tests with single XFH', () => {
  it('can handle single lock', async () => {
    const resolver = new GoogleResolver({
      hostname: 'us-central1-helix-225321.cloudfunctions.net',
      get: () => 'helix-deploy.anywhere.run',
      headers: {
        'x-ow-version-lock': 'foo=v2',
        'x-forwarded-host': 'helix-deploy.anywhere.run',
      },
    });
    assert.equal(
      resolver.createURL({ package: 'bar', name: 'foo', version: 'v1' }).href,
      'https://helix-deploy.anywhere.run/bar/foo@v2',
    );
  });

  it('can create url with no version', async () => {
    const resolver = new GoogleResolver({
      hostname: 'us-central1-helix-225321.cloudfunctions.net',
      get: () => 'helix-deploy.anywhere.run',
      headers: {
        host: 'foo.com',
      },
    });
    assert.equal(
      resolver.createURL({ package: 'bar', name: 'foo' }).href,
      'https://helix-deploy.anywhere.run/bar/foo',
    );
  });
});

describe('Google Resolver Tests with multiple XFH', () => {
  it('can handle single lock', async () => {
    const resolver = new GoogleResolver({
      hostname: 'us-central1-helix-225321.cloudfunctions.net',
      get: () => 'blog.adobe.com, theblog--adobe.hlx.page,helix-deploy.anywhere.run',
      headers: {
        'x-ow-version-lock': 'foo=v2',
        'x-forwarded-host': 'blog.adobe.com, theblog--adobe.hlx.page,helix-deploy.anywhere.run',
      },
    });
    assert.equal(
      resolver.createURL({ package: 'bar', name: 'foo', version: 'v1' }).href,
      'https://helix-deploy.anywhere.run/bar/foo@v2',
    );
  });

  it('can create url with no version', async () => {
    const resolver = new GoogleResolver({
      hostname: 'us-central1-helix-225321.cloudfunctions.net',
      get: () => 'blog.adobe.com, theblog--adobe.hlx.page,helix-deploy.anywhere.run',
      headers: {
        host: 'foo.com',
        'x-forwarded-host': 'blog.adobe.com, theblog--adobe.hlx.page,helix-deploy.anywhere.run',
      },
    });
    assert.equal(
      resolver.createURL({ package: 'bar', name: 'foo' }).href,
      'https://helix-deploy.anywhere.run/bar/foo',
    );
  });
});
