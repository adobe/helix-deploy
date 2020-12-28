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

/**
 * Options for the createURL function.
 */
export declare interface CreateURLOptions {
  /**
   * Action package name
   * @default ''
   */
  package?: string,

  /**
   * Action name
   */
  name: string,

  /**
   * Action version
   */
  version: string,
}

/**
 * Helper class for resolving action names to invocation URLs. It supports the version lock feature,
 * i.e. uses the information in the `x-ow-version-lock` header to lock the version of an action.
 */
export declare interface Resolver {
  /**
   * The name of the version lock header.
   */
  X_OW_VERSION_LOCK: string;

  /**
   * indicates if any locks were provided.
   */
  hasLocks: boolean;

  /**
   * Creates an URL for the specified action.
   * @param {CreateURLOptions} opts options
   * @return {URL} the action url
   */
  createURL(opts: CreateURLOptions): URL;
}
