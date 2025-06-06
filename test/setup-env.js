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
import path from 'path';
import { fileURLToPath } from 'url';

// eslint-disable-next-line no-console
console.log('Forcing HTTP/1.1 for @adobe/fetch');
process.env.HELIX_FETCH_FORCE_HTTP1 = 'true';
process.env.HELIX_DEPLOY_USE_LOCAL = 'true';

// eslint-disable-next-line no-underscore-dangle
global.__rootdir = path.resolve(fileURLToPath(import.meta.url), '..', '..');
