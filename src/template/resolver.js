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

/* eslint-disable max-classes-per-file,no-underscore-dangle */
const querystring = require('querystring');
const path = require('path').posix;

/**
 * Helper class for resolving action names to invocation URLs. It supports the version lock feature,
 * i.e. uses the information in the `x-ow-version-lock` header to lock the version of an action.
 */
class Resolver {
  /**
   * The name of the version lock header.
   * @returns {string} 'x-ow-version-lock'
   */
  static get X_OW_VERSION_LOCK() {
    return 'x-ow-version-lock';
  }

  constructor(headers = {}, log = console) {
    Object.assign(this, {
      _header: headers[Resolver.X_OW_VERSION_LOCK] || '',
      _log: log,
    });
    this._locks = querystring.parse(this._header);
    this._hasLocks = Object.keys(this._locks).length > 0;
    if (this.hasLocks) {
      this._log.info(`initialized resolve with version lock support for: ${JSON.stringify(this._locks)}`);
    }
  }

  get log() {
    return this._log;
  }

  get hasLocks() {
    return this._hasLocks;
  }

  /**
   * Returns the action url for the given coordinates
   * @param {string} packageName
   * @param {string} actionName
   * @param {string} version
   * @return {URL} the url.
   * @protected
   */
  // eslint-disable-next-line no-unused-vars,class-methods-use-this
  _createActionURL(packageName, actionName, version) {
    // dummy implementation for testing
    return new URL(path.join('urn:', packageName, actionName, version));
  }

  /**
   * Creates an url to the specified action / function.
   * @param {CreateURLOptions} opts
   * @return {URL} the url.
   */
  createURL(opts) {
    const {
      name,
      package: packageName = '',
      version = '',
    } = opts;
    if (!name) {
      throw Error('action name missing.');
    }
    const lockedVersion = this._locks[name] || version;
    if (lockedVersion !== version) {
      this.log.info(`Using locked version ${lockedVersion} for ${name} service.`);
    }
    return this._createActionURL(packageName, name, lockedVersion);
  }
}

class OpenwhiskResolver extends Resolver {
  /**
   * Initializes the openwhisk resolver
   * @param {object} params The openwhisk action params.
   */
  constructor(params) {
    super(params.__ow_headers, params.__ow_logger);
    Object.assign(this, {
      _apiHost: process.env.__OW_API_HOST,
      _namespace: process.env.__OW_NAMESPACE,
    });
  }

  _createActionURL(packageName, actionName, version) {
    const name = version ? `${actionName}@${version}` : actionName;
    return new URL(path.join(this._apiHost, '/api/v1/web', this._namespace, packageName, name));
  }
}

class AWSResolver extends Resolver {
  /**
   * Initializes the AWS resolver
   * @param {object} event The lambda event
   */
  constructor(event) {
    super(event.headers);
    Object.assign(this, {
      _host: event.requestContext.domainName,
    });
  }

  _createActionURL(packageName, actionName, version) {
    return new URL(path.join(`https://${this._host}`, packageName, actionName, version));
  }
}

class AzureResolver extends Resolver {
  /**
   * Initializes the Azure resolver
   * @param {object} context Azure context
   * @param {object} req Azure request
   */
  constructor(context, req) {
    super(req.headers);
  }

  // eslint-disable-next-line no-unused-vars,class-methods-use-this
  _createActionURL(packageName, actionName, version) {
    // dummy implementation for testing
    return new URL(path.join('azure:', packageName, actionName, version));
  }
}

class GoogleResolver extends Resolver {
  /**
   * Initializes the Google resolver
   * @param {object} req Google request
   */
  constructor(req) {
    super(req.headers);
    this.hostname = req.hostname;
    if (req.get('x-forwarded-host')) {
      this.universal = true;
      this.hostname = req
        .get('x-forwarded-host')
        .split(',')
        .map((h) => h.trim())
        .pop();
    }
  }

  // eslint-disable-next-line no-unused-vars,class-methods-use-this
  _createActionURL(packageName, actionName, version) {
    if (this.universal) {
      return new URL(path.join(`https://${this.hostname}`, packageName, `${actionName}${version.replace(/^(.)/, '@$1')}`));
    }
    return new URL(path.join(`https://${this.hostname}`, `${packageName}--${actionName}${version.replace(/^(.)/, '_$1').replace(/\./g, '_')}`));
  }
}

module.exports = {
  Resolver,
  AWSResolver,
  OpenwhiskResolver,
  GoogleResolver,
  AzureResolver,
};
