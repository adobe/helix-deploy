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

import { Resolver } from "./resolver";

/**
 * Path information of the context
 */
export declare interface PathInfo {
  /**
   * Request suffix (aka __ow_path)
   */
  suffix:string;
}

/**
 * Runtime information of the context
 */
export declare interface RuntimeInfo {
  /**
   * Runtime name
   */
  name:string;

  /**
   * Deploy region
   */
  region:string;
}

/**
 * Function information of the context
 */
export declare interface FunctionInfo {
  /**
   * Function name. Stemmed name of the function.
   * @example 'dispatch'
   */
  name:string;

  /**
   * Version in dotted format.
   * @example '4.3.1'
   */
  version:string;

  /**
   * Package name.
   * @example 'helix-services'
   */
  package:string;

  /**
   * Application name (aka namespace)
   * @example 'helix-pages'
   */
  app:string;

  /**
   * Fully qualified name (environment dependent).
   * @example '/helix/helix-services/dispatch@4.3.1'
   * @example 'arn:aws:lambda:us-east-1:118435662149:function:helix-services--dispatch:4_4_13'
   */
  fqn:string;
}

/**
 * Invocation information
 */
export declare interface InvocationInfo {
  /**
   * Invocation id (aka activation-id)
   */
  id:string;

  /**
   * Expiration time in unix epoch
   */
  deadline:number;
}

/**
 * Universal context
 */
export declare interface UniversalContext {

  /**
   * Function resolver
   */
  resolver:Resolver;

  /**
   * Path info
   */
  pathInfo:PathInfo;

  /**
   * Runtime info
   */
  runtime:RuntimeInfo;

  /**
   * Function info
   */
  func:FunctionInfo;

  /**
   * Invocation info
   */
  invocation:InvocationInfo;

  /**
   * User defined environment
   */
  env:object;
}

/**
 * Helix Universal Function
 */
export declare type UniversalFunction = (req: Request, context: UniversalContext) => Response;
