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
const {
  S3Client, CreateBucketCommand, PutObjectCommand, DeleteBucketCommand, DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
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
    return !!this._region && !!this._s3;
  }

  async init() {
    this._bucket = `poly-func-maker-temp-${crypto.randomBytes(16).toString('hex')}`;
    this._s3 = new S3Client({
      region: this._region,
    });
  }

  async createS3Bucket() {
    const data = await this._s3.send(new CreateBucketCommand({
      Bucket: this._bucket,
    }));
    this.log.info(`Bucket ${data.Location} created`);
  }

  async uploadZIP() {
    const relZip = path.relative(process.cwd(), this._builder.zipFile);

    this.log.info(`--: uploading ${relZip} to S3 bucket ${this._bucket} …`);
    const uploadParams = {
      Bucket: this._bucket,
      Key: relZip,
      Body: await fse.readFile(this._builder.zipFile),
    };

    await this._s3.send(new PutObjectCommand(uploadParams));

    this._key = relZip;
    this.log.info('File uploaded ');
  }

  async deleteS3Bucket() {
    await this._s3.send(new DeleteObjectCommand({
      Bucket: this._bucket,
      Key: this._key,
    }));
    await this._s3.send(new DeleteBucketCommand({
      Bucket: this._bucket,
    }));
    this.log.info(`Bucket ${this._bucket} emptied and deleted`);
  }

  async deploy() {
    try {
      await this.createS3Bucket();
      await this.uploadZIP();
      // await this.createLambda();
      await this.deleteS3Bucket();
    } catch (err) {
      this.log.error(`Unable to deploy Lambda function: ${err.message}`, err);
      throw err;
    }
  }
}

module.exports = AWSDeployer;
