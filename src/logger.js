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

/* eslint-disable no-underscore-dangle */

const fs = require('fs');
const { Writable } = require('stream');
const bunyan = require('bunyan');
const Bunyan2Loggly = require('bunyan-loggly');
const BunyanSyslog = require('@tripod/bunyan-syslog');

require('dotenv').config();

// default to simple log format
process.env.LOG_FORMAT = process.env.LOG_FORMAT || 'simple';

const LEVELS = {
  10: 'TRACE',
  20: 'DEBUG',
  30: 'INFO ',
  40: 'WARN ',
  50: 'ERROR',
  60: 'FATAL',
};

const SYSLOG_LEVELS = {
  10: 7,
  20: 7,
  30: 6,
  40: 4,
  50: 3,
  60: 0,
};

const serializers = {
  res: (res) => {
    if (!res || !res.statusCode) {
      return res;
    }
    return {
      statusCode: res.statusCode,
      duration: res.duration,
      headers: res.getHeaders(),
    };
  },
  req: bunyan.stdSerializers.req,
  err: bunyan.stdSerializers.err,
};

function safeCycles() {
  const seen = [];
  function bunyanCycles(_, v) {
    if (!v || typeof (v) !== 'object') {
      return (v);
    }
    if (seen.indexOf(v) !== -1) {
      return ('[Circular]');
    }
    seen.push(v);
    return (v);
  }

  return (bunyanCycles);
}

class SimpleFormat extends Writable {
  constructor(options = {}, base = process.stdout) {
    super();
    this.out = base;
    this.wskLog = options.wskLog;
  }

  write(rec) {
    const {
      hostname,
      level,
      time,
      req,
      res,
      ow: {
        activationId: id = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        actionName: name = 'unknown',
      },
    } = rec;
    let {
      msg,
    } = rec;
    if (this.wskLog) {
      const line = `${LEVELS[level]} - ${msg}\n`;
      this.out.write(line);
    } else {
      // use _send directly, so we can avoid the json serialization of 'rec'
      const date = new Date(time).toJSON();
      if (req || res) {
        msg = JSON.stringify({
          req,
          res,
        }, safeCycles(), 2);
      }
      const line = `<${8 + SYSLOG_LEVELS[level]}>${date} ${hostname} ${name}[0]:${id.substring(0, 16)} ${LEVELS[level]} ${msg}`;
      this.out._send(line);
    }
  }
}

function addLogglyStream(logger, params) {
  if (!(params && params.LOGGLY_SUBDOMAIN && params.LOGGLY_TOKEN)) {
    return false;
  }

  // check if not already added
  if (logger.streams.find((s) => s.name === 'LogglyStream')) {
    // eslint-disable-next-line no-console
    console.log('(Loggly stream already added)');
    return true;
  }

  const logglyConfig = {
    token: params.LOGGLY_TOKEN,
    subdomain: params.LOGGLY_SUBDOMAIN,
  };
  const bufferLength = 1000;
  const bufferTimeout = 500;
  logger.addStream({
    type: 'raw',
    level: process.env.LOG_LEVEL || 'info',
    stream: new Bunyan2Loggly(logglyConfig, bufferLength, bufferTimeout),
  });
  return true;
}

function addPaperTrailStream(logger, params) {
  if (!(params && params.PAPERTRAIL_HOST && params.PAPERTRAIL_PORT)) {
    return false;
  }

  // check if not already added
  if (logger.streams.find((s) => s.name === 'PapertrailStream')) {
    // eslint-disable-next-line no-console
    console.log('(Papertrail stream already added)');
    return true;
  }

  const syslogStream = BunyanSyslog.createBunyanStream({
    type: 'tcp',
    host: params.PAPERTRAIL_HOST,
    port: Number.parseInt(params.PAPERTRAIL_PORT, 10),
  });

  logger.addStream({
    name: 'PapertrailStream',
    type: 'raw',
    level: process.env.LOG_LEVEL || 'info',
    stream: new SimpleFormat({}, syslogStream),
  });

  return true;
}

function initLogger(logger, params) {
  // eslint-disable-next-line no-param-reassign
  logger.fields.ow = {
    activationId: process.env.__OW_ACTIVATION_ID,
    actionName: process.env.__OW_ACTION_NAME,
  };

  const logs = [];
  if (addLogglyStream(logger, params)) {
    logs.push('loggly');
  }
  if (addPaperTrailStream(logger, params)) {
    logs.push('papertrail');
  }

  if (logs.length === 0) {
    logger.info('no external loggers configured.');
  } else {
    // eslint-disable-next-line no-console
    console.log('configured external logger(s): ', logs);

    // eslint-disable-next-line no-param-reassign
    logger.flush = async function flush() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 5000);
      });
    };
  }
}

module.exports = function getLogger(params, logger) {
  if (!logger) {
    const pkgJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    // eslint-disable-next-line no-param-reassign
    logger = bunyan.createLogger({
      name: pkgJson.name,
      serializers,
      streams: [{
        level: process.env.LOG_LEVEL || 'info',
        type: 'raw',
        stream: new SimpleFormat({
          wskLog: true,
        }),
      }],
    });
  }

  initLogger(logger, params);
  return logger;
};

module.exports.init = initLogger;
