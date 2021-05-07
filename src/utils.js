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
 * @param {NamedAction[]} namedfns - a list of actions, all with the same name
 * @param {Date} now - date time to use as reference for age comparisons
 * @param {RangeSpec} rangespec - which versions to keep
 * @param {VersionSpec} versionspec - which version is current
 * @returns {NamedAction[]} - a list of actions that can safely be deleted
 */
function filterActions(namedfns, now, {
  ciAge, patchAge, minorAge, majorAge,
} = {}, { patchVersion, minorVersion, majorVersion } = {}) {
  const cleanci = namedfns.filter((fn) => ciAge
      && fn.version.ci
      && fn.updated < new Date(now - (1000 * ciAge)));
  const cleanpatch = namedfns.filter((fn) => patchAge
      && fn.version.patch
      && fn.version.patch < patchVersion
      && fn.version.minor === minorVersion
      && fn.version.major === majorVersion
      && fn.updated < new Date(now - (1000 * patchAge)));

  const cleanminor = namedfns.filter((fn) => minorAge
      && fn.version.minor
      && fn.version.minor < minorVersion
      && fn.version.major === majorVersion
      && fn.updated < new Date(now - (1000 * minorAge)));

  const cleanmajor = namedfns.filter((fn) => majorAge
      && fn.version.major
      && fn.version.major < majorVersion
      && fn.updated < new Date(now - (1000 * majorAge)));

  return [...cleanci, ...cleanpatch, ...cleanminor, ...cleanmajor];
}

module.exports = { filterActions };
