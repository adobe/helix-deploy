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
    // eslint-disable-next-line no-console
    console.error(`Unable to load secrets from ${name}`, err);
    return { };
  }
}

module.exports = getGoogleSecrets;
