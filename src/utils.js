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
const { fork } = require('child_process');
const path = require('path');

/**
 * @typedef {object} VersionCoordinates
 * @property {number} ci - CI build number
 * @property {number} patch - semver patch version
 * @property {number} minor - semver minor version
 * @property {number} major - semver major version
 */
/**
 * @typedef {object} VersionSpec
 * @property {number} patchVersion - semver patch version
 * @property {number} minorVersion - semver minor version
 * @property {number} majorVersion - semver major version
 */
/**
 * @typedef {object} RangeSpec
 * @property {number} ciAge - number of seconds to keep outdated CI builds
 * @property {number} patchAge - number of seconds to keep outdated patch versions
 * @property {number} minorAge - number of seconds to keep outdated minor versions
 * @property {number} majorAge - number of seconds to keep outdated major versions
 * @property {number} ciAge - number of outdated CI builds to keep
 * @property {number} patchAge - number of outdated patch versions to keep
 * @property {number} minorAge - number of outdated minor versions to keep
 * @property {number} majorAge - number of outdated major versions to keep
 */
/**
 * @typedef {object} NamedAction
 * @property {string} name - short name of the action, e.g. `embed`
 * @property {string} fqName - fully qualified name of the action, dependent on deployer, e.g.
 * `projects/helix-225321/locations/us-central1/functions/helix-services--data-embed_2_4_0`
 * @property {VersionCoordinates} version - version of the action
 * @property {Date} updated - timestamp of the update of the action
 */

/**
 * Filters a list of named actions according
 * to maximum age or number of versions.
 * @param {NamedAction[]} fns - a list of actions, all with the same name
 * @param {Date} now - date time to use as reference for age comparisons
 * @param {RangeSpec} rangespec - which versions to keep
 * @param {VersionSpec} versionspec - which version is current
 * @returns {NamedAction[]} - a list of actions that can safely be deleted
 */
function filterActions(fns, now, {
  ciAge, patchAge, minorAge, majorAge, ciNum, patchNum, minorNum, majorNum,
} = {}, { patchVersion, minorVersion, majorVersion } = {}) {
  // sort by updated date
  const namedfns = fns.sort((a, b) => {
    if (a.updated && b.updated) {
      return a.updated - b.updated;
    }
    return 0;
  });

  function bycount(max) {
    return (_, index, { length }) => index + max < length;
  }

  function bydate(age) {
    return ({ updated }) => updated < new Date(now - (1000 * age));
  }

  function has(prop) {
    return () => !!prop;
  }

  function hasVersion(prop) {
    return (fn) => !!fn.version[prop];
  }

  function matchVersion(name) {
    return (fn) => {
      if (name === 'patch') {
        return fn.version.patch < patchVersion
          && fn.version.minor === minorVersion
          && fn.version.major === majorVersion;
      }
      if (name === 'minor') {
        return fn.version.minor < minorVersion
          && fn.version.major === majorVersion;
      }
      if (name === 'major') {
        return fn.version.major < majorVersion;
      }
      return false;
    };
  }

  const cleancibyage = namedfns
    .filter(has(ciAge))
    .filter(hasVersion('ci'))
    .filter(bydate(ciAge));

  const cleancibycount = namedfns
    .filter(has(ciNum))
    .filter(hasVersion('ci'))
    .filter(bycount(ciNum));

  const cleanpatchbyage = namedfns
    .filter(has(patchAge))
    .filter(hasVersion('patch'))
    .filter(matchVersion('patch'))
    .filter(bydate(patchAge));

  const cleanpatchbycount = namedfns
    .filter(has(patchNum))
    .filter(hasVersion('patch'))
    .filter(matchVersion('patch'))
    .filter(bycount(patchNum));

  const cleanminorbyage = namedfns
    .filter(has(minorAge))
    .filter(hasVersion('minor'))
    .filter(matchVersion('minor'))
    .filter(bydate(minorAge));

  const cleanminorbycount = namedfns
    .filter(has(minorNum))
    .filter(hasVersion('minor'))
    .filter(matchVersion('minor'))
    .filter(bycount(minorNum));

  const cleanmajorbyage = namedfns
    .filter(has(majorAge))
    .filter(hasVersion('major'))
    .filter(matchVersion('major'))
    .filter(bydate(majorAge));

  const cleanmajorbycount = namedfns
    .filter(has(majorNum))
    .filter(hasVersion('major'))
    .filter(matchVersion('major'))
    .filter(bycount(majorNum));

  return [...cleancibyage, ...cleancibycount,
    ...cleanpatchbyage, ...cleanpatchbycount,
    ...cleanminorbyage, ...cleanminorbycount,
    ...cleanmajorbyage, ...cleanmajorbycount];
}

async function validateBundle(bundlePath, invoke = false) {
  const opts = {
    invoke,
  };
  const child = fork(path.resolve(__dirname, 'template', 'validate-bundle.js'), [bundlePath, JSON.stringify(opts)]);
  const ret = await new Promise((resolve, reject) => {
    child.on('message', resolve);
    child.on('error', reject);
    child.on('exit', (code) => {
      resolve(JSON.stringify({
        status: 'error',
        error: `Child process stopped with exit code ${code}`,
      }));
    });
  });
  return JSON.parse(ret);
}

module.exports = {
  filterActions,
  validateBundle,
};
