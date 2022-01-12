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
import Fastly from '@adobe/fastly-native-promises';
import chalk from 'chalk-template';
import FastlyConfig from './FastlyConfig.js';
import BaseDeployer from '../deploy/BaseDeployer.js';

const {
  toString, vcl, time, req, res, str, concat,
} = Fastly.loghelpers;

export default class FastlyGateway {
  constructor(baseConfig, config) {
    Object.assign(this, {
      cfg: baseConfig,
      _cfg: config,
      isGateway: true,
      id: 'fastly',
      _fastly: null,
      _deployers: [],
    });
  }

  ready() {
    return !!this._cfg.service && !!this._cfg.auth;
  }

  canDeploy() {
    return this.ready() && this._deployers.length > 0;
  }

  async updateLinks(links, version) {
    this.log.info(`--: updating links on the Gateway for version ${version}...`);
    const fakeDeployer = new BaseDeployer({
      links, version, log: this.log,
    });

    const versionstrings = fakeDeployer
      .getLinkVersions()
      .map((versionstring) => `/${this.cfg.packageName}/${this.cfg.name.replace(/@.*/, '')}@${versionstring}`)
      .map((key) => ({
        item_key: key,
        item_value: `@${version}`,
        op: 'upsert',
      }));

    await this._fastly.bulkUpdateDictItems(undefined, 'aliases', ...versionstrings);
    this._fastly.discard();
    this.log.info(chalk`{green ok:} updated links on the Gateway for version ${version}.`);
  }

  init() {
    if ((this.ready() || this.updateable) && !this._fastly) {
      this._fastly = Fastly(this._cfg.auth, this._cfg.service);
    }
  }

  withDeployer(value) {
    this._deployers.push(value);
    return this;
  }

  get log() {
    return this.cfg.log;
  }

  async updatePackage() {
    this.log.info('--: updating app (package) parameters on Fastly gateway ...');

    const packageparams = Object
      .entries(this.cfg.packageParams)
      .map(([key, value]) => ({
        item_key: `${this.cfg.packageName}.${key}`,
        item_value: value,
        op: 'update',
      }));

    if (packageparams.length !== 0) {
      await this._fastly.bulkUpdateDictItems(undefined, 'packageparams', ...packageparams);
    }
    await this._fastly.updateDictItem(undefined, 'tokens', this.cfg.packageToken, `${Math.floor(Date.now() / 1000) + (365 * 24 * 3600)}`);
    this._fastly.discard();
    this.log.info(chalk`{green ok:} updating app (package) parameters on Fastly gateway.`);
  }

  selectBackendVCL() {
    // declare a local variable for each backend
    const init = this._deployers.map((deployer) => `declare local var.${deployer.name.toLowerCase()} INTEGER;`);

    // get the desired weight for each backend
    const set = this._deployers.map((deployer) => `set var.${deployer.name.toLowerCase()} = std.atoi(table.lookup(priorities, "${deployer.name.toLowerCase()}", "${Math.floor((100 / this._deployers.length))}"));`);

    // for all but the first, sum up the weights
    const increment = this._deployers
      .slice(1)
      .map((deployer, i) => ([deployer.name, this._deployers[i].name]))
      .map(([current, previous]) => `set var.${current.toLowerCase()} += var.${previous.toLowerCase()};`);

    const backendvcl = `
      declare local var.i INTEGER;
      set var.i = randomint(0, 100);

      set req.http.X-Backend-Health = ${this._deployers.map((deployer) => `backend.F_${deployer.name}.healthy`).join(' + " " + ')};

      if (false) {}`;

    const middle = this._deployers.map((deployer) => `if((var.i <= var.${deployer.name.toLowerCase()} && backend.F_${deployer.name}.healthy) && subfield(req.http.x-ow-version-lock, "env", "&") !~ ".?" || subfield(req.http.x-ow-version-lock, "env", "&") == "${deployer.name.toLowerCase()}") {
      set req.backend = F_${deployer.name};
      ${this._deployers[0].customVCL}
    }`);

    const fallback = `{
      set req.backend = F_${this._deployers[0].name};
      ${this._deployers[0].customVCL}
    }`;

    return [...init, ...set, ...increment].join('\n') + [backendvcl, ...middle, fallback].join(' else ');
  }

  /**
   * Generates a VCL snippet (for each package deployed) that lists all package parameter
   * names and looks up their values from the secret edge dictionary.
   * @returns {string} VCL snippet to look up package parameters from edge dict
   */
  listPackageParamsVCL() {
    const pre = `
    if (obj.status == 600 && req.url.path ~ "^/${this.cfg.packageName}/") {
      set obj.status = 200;
      set obj.response = "OK";
      set obj.http.content-type = "application/json";
      synthetic "{" + `;
    const post = `+ "}";
    return(deliver);
}`;
    const middle = Object
      .keys(this.cfg.packageParams)
      .map((paramname, index) => `"%22${paramname}%22:%22" json.escape(table.lookup(packageparams, "${this.cfg.packageName}.${paramname}")) "%22${(index + 1) < Object.keys(this.cfg.packageParams).length ? ',' : ''}"`).join(' + ');

    return pre + middle + post;
  }

  setURLVCL() {
    const pre = `
declare local var.package STRING;
declare local var.action STRING;
declare local var.version STRING;
declare local var._version STRING;
declare local var.atversion STRING;
declare local var.slashversion STRING;
declare local var.rest STRING;
declare local var.fullpath STRING;

set var.version = "";
set var.rest = "";

if (req.url ~ "^/([^/]+)/([^/@_]+)([@_]([^/@_?]+)+)?(.*$)") {
  log "match";
  set var.package = re.group.1;
  set var.action = re.group.2;
  set var.version = re.group.3;

  set var.fullpath = "/" + var.package + "/" + var.action + regsub(var.version, "[@_]", "@");
  
  set var.version = table.lookup(aliases, var.fullpath, var.version);

  set var.rest = re.group.5;

  // normalize version divider
  set var._version = regsub(var.version, "[@_]", "_");
  set var.atversion = regsub(var.version, "[@_]", "@");
  set var.slashversion = regsub(var.version, "[@_]", "/");
}
`;
    return pre + this._deployers.map((deployer) => `
      if (req.backend == F_${deployer.name}) {
        set bereq.url = ${deployer.urlVCL};
      }
      `).join('\n');
  }

  async enableLogging(version) {
    if (this._cfg.coralogixToken) {
      this.log.info(chalk`--: Set up Gateway logging to {yellow Coralogix}`);
      await this._fastly.writeHttps(version, 'helix-coralogix', {
        name: 'helix-coralogix',
        format: toString({
          timestamp: vcl`time.start.msec`,
          subsystemName: str(vcl`req.service_id`),
          severity: concat(
            vcl`if(resp.status<400, "3", "")`,
            vcl`if(resp.status>=400 && resp.status<500, "4", "")`,
            vcl`if(resp.status>=500, "5", "")`,
          ),
          json: {
            ow: {
              environment: str(vcl`regsub(req.backend, ".*_", "")`),
              actionName: str(vcl`regsub(req.url, "^/([^/]+)/([^/@_]+)([@_]([^/@_?]+)+)?(.*$)", "\\\\1/\\\\2@\\\\4")`),
              activationId: str(concat(
                vcl`if(resp.http.x-openwhisk-activation-id != "", resp.http.x-openwhisk-activation-id, "")`,
                vcl`if(resp.http.Apigw-Requestid != "", resp.http.Apigw-Requestid, "")`,
                vcl`if(resp.http.Function-Execution-Id != "", resp.http.Function-Execution-Id, "")`,
              )),
              transactionId: str(concat(
                vcl`if(resp.http.x-request-id != "", resp.http.x-request-id, "")`,
                vcl`if(resp.http.x-amazn-trace-id != "", resp.http.x-amazn-trace-id, "")`,
                vcl`if(resp.http.X-Cloud-Trace-Context != "", resp.http.X-Cloud-Trace-Context, "")`,
              )),
            },
            time: {
              start: str(
                concat(
                  time`begin:%Y-%m-%dT%H:%M:%S`,
                  '.',
                  time`begin:msec_frac`,
                  time`begin:%z`,
                ),
              ),
              start_msec: vcl`time.start.msec`,
              end: str(
                concat(
                  time`end:%Y-%m-%dT%H:%M:%S`,
                  '.',
                  time`end:msec_frac`,
                  time`end:%z`,
                ),
              ),
              end_msec: vcl`time.end.msec`,
              elapsed: '%D',
            },
            client: {
              name: str(vcl`client.as.name`),
              number: vcl`client.as.number`,
              location_geopoint: {
                lat: vcl`client.geo.latitude`,
                lon: vcl`client.geo.longitude`,
              },
              city_name: str(vcl`client.geo.city.ascii`),
              country_name: str(vcl`client.geo.country_name.ascii`),
              connection_speed: str(vcl`client.geo.conn_speed`),
              ip: str(
                vcl`regsuball(req.http.x-forwarded-for, ",.*", "")`,
              ),
            },
            request: {
              id: str(vcl`if(req.http.X-CDN-Request-ID, req.http.X-CDN-Request-ID, randomstr(8, "0123456789abcdef") + "-" + randomstr(4, "0123456789abcdef") + "-" + randomstr(4, "0123456789abcdef") + "-" + randomstr(1, "89ab") + randomstr(3, "0123456789abcdef") + "-" + randomstr(12, "0123456789abcdef"))`),
              method: str('%m'),
              protocol: str(vcl`if(fastly_info.is_h2, "HTTP/2", "HTTP/1.1")`),
              h2: vcl`if(fastly_info.is_h2, "true", "false")`,
              is_ipv6: vcl`if(req.is_ipv6, "true", "false")`,
              url: str(vcl`cstr_escape(if(req.http.X-Orig-Url, req.http.X-Orig-Url, req.url))`),
              referer: req`Referer`,
              user_agent: req`User-Agent`,
              accept_content: req`Accept`,
              accept_language: req`Accept-Language`,
              accept_encoding: req`Accept-Encoding`,
              accept_charset: req`Accept-Charset`,
              xfh: req`X-Forwarded-Host`,
              via: req`Via`,
              cache_control: req`Cache-Control`,
              header_size: vcl`req.header_bytes_read`,
              body_size: vcl`req.body_bytes_read`,
              restarts: vcl`req.restarts`,
              versionlock: req`X-OW-Version-Lock`,
            },
            origin: {
              host: str('%v'),
              url: str(vcl`if(req.http.x-backend-url, req.http.x-backend-url, req.url)`),
            },
            response: {
              status: '%s',
              error: str(vcl`resp.http.x-error`),
              content_type: res`Content-Type`,
              header_size: vcl`resp.header_bytes_written`,
              body_size: '%B',
            },
            edge: {
              cache_status: str(vcl`fastly_info.state`),
              datacenter: str(vcl`server.datacenter`),
              ip: str('%A'),
            },
          },
          applicationName: str(this._cfg.coralogixApp),
        }),
        url: 'https://api.coralogix.com/logs/rest/singles',
        request_max_bytes: 2000000,
        content_type: 'application/json',
        header_name: 'private_key',
        header_value: this._cfg.coralogixToken,
        json_format: 1,
        service_id: this._cfg.service,
      });
    }
  }

  async deploy() {
    this.log.info(chalk`--: Set up {yellow Fastly} Gateway`);
    try {
      await this._fastly.transact(async (newversion) => {
        await this.enableLogging(newversion);

        this.log.info('--: create condition');
        await this._fastly.writeCondition(newversion, 'false', {
          name: 'false',
          statement: 'false',
          type: 'request',
        });

        this.log.info('--: create dictionaries');
        await this._fastly.writeDictionary(newversion, 'priorities', {
          name: 'priorities',
          write_only: 'false',
        });

        await this._fastly.writeDictionary(newversion, 'aliases', {
          name: 'aliases',
          write_only: 'false',
        });

        await this._fastly.writeDictionary(newversion, 'tokens', {
          name: 'tokens',
          write_only: 'false',
        });

        await this._fastly.writeDictionary(newversion, 'packageparams', {
          name: 'packageparams',
          write_only: 'true',
        });

        if (this._cfg.checkinterval > 0 && this._cfg.checkpath) {
          this.log.info('--: setup health-check');
          // set up health checks
          await Promise.all(this._deployers
            .map((deployer) => ({
              check_interval: this._cfg.checkinterval,
              expected_response: 200,
              host: deployer.host,
              http_version: '1.1',
              method: 'GET',
              initial: 1,
              name: `${deployer.name}Check`,
              path: `${deployer.basePath}${this._cfg.checkpath}`,
              threshold: 2,
              timeout: 5000,
              window: 3,
            }))
            .map((healthcheck) => this._fastly
              .writeHealthcheck(newversion, healthcheck.name, healthcheck)));
        }

        // set up backends
        await Promise.all(this._deployers
          .map((deployer) => ({
            hostname: deployer.host,
            ssl_cert_hostname: deployer.host,
            ssl_sni_hostname: deployer.host,
            address: deployer.host,
            override_host: deployer.host,
            name: deployer.name,
            error_threshold: 0,
            first_byte_timeout: 60000,
            weight: 100,
            connect_timeout: 5000,
            port: 443,
            between_bytes_timeout: 10000,
            shield: '', // 'bwi-va-us',
            max_conn: 200,
            use_ssl: true,
            request_condition: 'false',
          }))
          .map((backend) => {
            const retval = backend;
            if (this._cfg.checkinterval > 0 && this._cfg.checkpath) {
              retval.healthcheck = `${backend.name}Check`;
            }
            return retval;
          })
          .map(async (backend) => {
            this.log.info(`--: create backend ${backend.name} -> ${backend.hostname}`);
            try {
              return await this._fastly.createBackend(newversion, backend);
            } catch (e) {
              return this._fastly.updateBackend(newversion, backend.name, backend);
            }
          }));

        this.log.info('--: write VLC snippets');
        await this._fastly.writeSnippet(newversion, 'packageparams.auth', {
          name: 'packageparams.auth',
          priority: 9,
          dynamic: 0,
          type: 'recv',
          content: `
  if (req.http.Authorization) {
    if(time.is_after(std.time(table.lookup(tokens, regsub(req.http.Authorization, "^Bearer ", ""), "expired"), std.integer2time(0)), time.start)) {
      error 600 "Get Package Params";
    }
  }`,
        });

        await this._fastly.writeSnippet(newversion, `${this.cfg.packageName}.params`, {
          name: `${this.cfg.packageName}.params`,
          priority: 10,
          dynamic: 0,
          type: 'error',
          content: this.listPackageParamsVCL(),
        });

        await this._fastly.writeSnippet(newversion, 'backend', {
          name: 'backend',
          priority: 10,
          dynamic: 0,
          type: 'recv',
          content: this.selectBackendVCL(),
        });

        await this._fastly.writeSnippet(newversion, 'missurl', {
          name: 'missurl',
          priority: 10,
          dynamic: 0,
          type: 'miss',
          content: this.setURLVCL(),
        });

        await this._fastly.writeSnippet(newversion, 'passurl', {
          name: 'passurl',
          priority: 10,
          dynamic: 0,
          type: 'pass',
          content: this.setURLVCL(),
        });

        await this._fastly.writeSnippet(newversion, 'logurl', {
          name: 'logurl',
          priority: 10,
          dynamic: 0,
          type: 'fetch',
          content: `set beresp.http.X-Backend-URL = bereq.url;
  set beresp.http.X-Backend-Name = req.backend;
  set beresp.http.X-Backend-Health = req.http.X-Backend-Health;
  set beresp.cacheable = false;`,
        });

        await this._fastly.writeSnippet(newversion, 'stashsurrogates', {
          name: 'stashsurrogates',
          priority: 10,
          dynamic: 0,
          type: 'fetch',
          content: `
  set beresp.http.X-Surrogate-Key = beresp.http.Surrogate-Key;
  set beresp.http.X-Surrogate-Control = beresp.http.Surrogate-Control;`,
        });

        let restartcontent = `
  # restart the request in case of flakiness
  if (req.restarts < 2 && (resp.status == 503 || resp.status == 504) && (req.request == "GET" || req.request == "HEAD" || req.request == "PUT" || req.request == "DELETE")) {
    restart;
  }
  set resp.http.x-gateway-restarts = req.restarts;
  unset resp.http.Fastly-Restarts;`;

        if (this._deployers.find((deployer) => deployer.name === 'Google')) {
          restartcontent += `
  # If Google can't find a function, it sends a redirect to the login page instead
  # of a 404. This fixes it.
  if (resp.status == 302 && req.backend == F_Google && resp.http.Location ~ "^https://accounts.google.com/ServiceLogin") {
    set resp.status = 404;
  }
  `;
        }
        await this._fastly.writeSnippet(newversion, 'restart', {
          name: 'restart',
          priority: 10,
          dynamic: 0,
          type: 'deliver',
          content: restartcontent,
        });

        await this._fastly.writeSnippet(newversion, 'restoresurrogates', {
          name: 'restoresurrogates',
          priority: 10,
          dynamic: 0,
          type: 'deliver',
          content: `
  set resp.http.Surrogate-Key = resp.http.X-Surrogate-Key;
  set resp.http.Surrogate-Control = resp.http.X-Surrogate-Control;`,
        });
      }, true);

      this.log.info(chalk`{green ok}: Set up {yellow Fastly} Gateway done.`);
    } catch (e) {
      this.log.error(chalk`{red error}: failed to setup gateway: ${e.message}`);
      throw e;
    } finally {
      this._fastly.discard();
    }
  }
}

FastlyGateway.Config = FastlyConfig;
