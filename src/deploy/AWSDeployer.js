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
const { S3Client, CreateBucketCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const fse = require('fs-extra');
const crypto = require('crypto');
const BaseDeployer = require('./BaseDeployer');

class AWSDeployer extends BaseDeployer {
  constructor(builder) {
    super(builder);

    Object.assign(this, {
      _region: '',
    });
  }

  withAWSRegion(value) {
    this._region = value;
    return this;
  }

  ready() {
    return !!this._region;
  }

  async init() {
    this._bucket = `poly-func-maker-temp-${crypto.randomBytes(16).toString('hex')}`;
    this._s3 = new S3Client(this._region);
  }

  async createS3Bucket() {
    const data = await this._s3.send(new CreateBucketCommand({
      Bucket: this._bucket,
    }));
    this.log().info('Bucket created ', data);
  }

  async uploadZIP() {
    const relZip = path.relative(process.cwd(), this._builder.zipFile);

    this.log.info(`--: uploading ${relZip} to S3 bucket ${this._bucket} …`);
    const uploadParams = {
      Bucket: this._bucket,
      Key: relZip,
      Body: await fse.readFile(this._builder.zipFile),
    };

    const data = this._s3.send(new PutObjectCommand(uploadParams));
    this.log().info('File uploaded ', data);
  }

  async deploy() {
    try {
      await this.createS3Bucket();
      await this.uploadZIP();
      // await createLambda();
      // await deleteS3Bucket();
    } catch (err) {
      this.log.error(`Unable to deploy Lambda function: ${err.message}`);
      throw err;
    }
  }
}

module.exports = AWSDeployer;
