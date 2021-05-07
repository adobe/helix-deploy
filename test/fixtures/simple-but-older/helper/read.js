/*
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
const fs = require('fs');
const path = require('path');

module.exports = () => {
  try {
    const hello = path.resolve(process.platform === 'win32' ? __filename : __dirname, '..', 'files', 'hello.txt');
    const data = fs.readFileSync(hello, 'utf-8');
    // eslint-disable-next-line no-console
    console.log(hello, data);
    return data;
  } catch (e) {
    return `
${e.message}
${e.stack}
${__dirname}
${__filename}
${process.cwd()}
${require.main.path}
${process.platform === 'win32'}
`;
  }
};
