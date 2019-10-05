## [2.1.1](https://github.com/adobe/openwhisk-action-builder/compare/v2.1.0...v2.1.1) (2019-10-05)


### Bug Fixes

* **builder:** add option to specify specify link package name ([#66](https://github.com/adobe/openwhisk-action-builder/issues/66)) ([c0ae740](https://github.com/adobe/openwhisk-action-builder/commit/c0ae740))

# [2.1.0](https://github.com/adobe/openwhisk-action-builder/compare/v2.0.0...v2.1.0) (2019-09-02)


### Features

* **builder:** add options for --web-secure ([#65](https://github.com/adobe/openwhisk-action-builder/issues/65)) ([dba7639](https://github.com/adobe/openwhisk-action-builder/commit/dba7639))

# [2.0.0](https://github.com/adobe/openwhisk-action-builder/compare/v1.3.1...v2.0.0) (2019-08-19)


### Code Refactoring

* **lib:** extract helper to own package ([#60](https://github.com/adobe/openwhisk-action-builder/issues/60)) ([de04fcd](https://github.com/adobe/openwhisk-action-builder/commit/de04fcd))


### BREAKING CHANGES

* **lib:** logging and expressify are no longer exported by this package. use @adobe/openwhisk-action-utils instead.

## [1.3.1](https://github.com/adobe/openwhisk-action-builder/compare/v1.3.0...v1.3.1) (2019-07-31)


### Bug Fixes

* **builder:** fix error when linking with [@ci](https://github.com/ci) ([02a47a5](https://github.com/adobe/openwhisk-action-builder/commit/02a47a5))

# [1.3.0](https://github.com/adobe/openwhisk-action-builder/compare/v1.2.2...v1.3.0) (2019-07-31)


### Features

* **builder:** add option to generate link to [@ci](https://github.com/ci) ([#56](https://github.com/adobe/openwhisk-action-builder/issues/56)) ([8d1ae73](https://github.com/adobe/openwhisk-action-builder/commit/8d1ae73))

## [1.2.2](https://github.com/adobe/openwhisk-action-builder/compare/v1.2.1...v1.2.2) (2019-07-25)


### Bug Fixes

* **builder:** signal error during sequence updates ([d239066](https://github.com/adobe/openwhisk-action-builder/commit/d239066)), closes [#53](https://github.com/adobe/openwhisk-action-builder/issues/53)
* **external:** declare all openwhisk files as external ([2271598](https://github.com/adobe/openwhisk-action-builder/commit/2271598)), closes [#54](https://github.com/adobe/openwhisk-action-builder/issues/54)

## [1.2.1](https://github.com/adobe/openwhisk-action-builder/compare/v1.2.0...v1.2.1) (2019-07-24)


### Bug Fixes

* **builder:** remove externals that are not really present ([61bbaa8](https://github.com/adobe/openwhisk-action-builder/commit/61bbaa8))

# [1.2.0](https://github.com/adobe/openwhisk-action-builder/compare/v1.1.3...v1.2.0) (2019-07-23)


### Bug Fixes

* **builder:** set process.exitCode on failure ([35c7dbd](https://github.com/adobe/openwhisk-action-builder/commit/35c7dbd)), closes [#34](https://github.com/adobe/openwhisk-action-builder/issues/34)


### Features

* **builder:** add possibility to specify test url ([e450a85](https://github.com/adobe/openwhisk-action-builder/commit/e450a85)), closes [#51](https://github.com/adobe/openwhisk-action-builder/issues/51)
* **builder:** create option to create symlinks ([fbf37e4](https://github.com/adobe/openwhisk-action-builder/commit/fbf37e4)), closes [#48](https://github.com/adobe/openwhisk-action-builder/issues/48)
* **builder:** use version from package json in action name ([3717eca](https://github.com/adobe/openwhisk-action-builder/commit/3717eca)), closes [#49](https://github.com/adobe/openwhisk-action-builder/issues/49)

## [1.1.3](https://github.com/adobe/openwhisk-action-builder/compare/v1.1.2...v1.1.3) (2019-07-18)


### Bug Fixes

* **build:** instruct webpack to use correct __dirname ([#47](https://github.com/adobe/openwhisk-action-builder/issues/47)) ([36d9242](https://github.com/adobe/openwhisk-action-builder/commit/36d9242)), closes [#39](https://github.com/adobe/openwhisk-action-builder/issues/39)

## [1.1.2](https://github.com/adobe/openwhisk-action-builder/compare/v1.1.1...v1.1.2) (2019-07-18)


### Bug Fixes

* **cli:** prefer process.env over .wskprops ([#46](https://github.com/adobe/openwhisk-action-builder/issues/46)) ([c9eb849](https://github.com/adobe/openwhisk-action-builder/commit/c9eb849)), closes [#42](https://github.com/adobe/openwhisk-action-builder/issues/42)

## [1.1.1](https://github.com/adobe/openwhisk-action-builder/compare/v1.1.0...v1.1.1) (2019-07-05)


### Bug Fixes

* **dep:** update dependencies ([53878a0](https://github.com/adobe/openwhisk-action-builder/commit/53878a0))

# [1.1.0](https://github.com/adobe/openwhisk-action-builder/compare/v1.0.2...v1.1.0) (2019-06-24)


### Features

* **openwhisk:** add new `--timeout` limit option ([936880d](https://github.com/adobe/openwhisk-action-builder/commit/936880d)), closes [#37](https://github.com/adobe/openwhisk-action-builder/issues/37)

## [1.0.2](https://github.com/adobe/openwhisk-action-builder/compare/v1.0.1...v1.0.2) (2019-05-12)


### Bug Fixes

* **package:** update fs-extra to version 8.0.0 ([fd2869d](https://github.com/adobe/openwhisk-action-builder/commit/fd2869d))

## [1.0.1](https://github.com/adobe/openwhisk-action-builder/compare/v1.0.0...v1.0.1) (2019-05-09)


### Bug Fixes

* **expressify:** fallback to application/octet-stream if no content-type provided ([8d69dcc](https://github.com/adobe/openwhisk-action-builder/commit/8d69dcc))

# [1.0.0](https://github.com/adobe/openwhisk-action-builder/compare/v0.9.0...v1.0.0) (2019-05-09)


### Features

* **expressify:** set isBase64Encoded flag correctly to ensure proper decoding ([e555c6e](https://github.com/adobe/openwhisk-action-builder/commit/e555c6e))


### BREAKING CHANGES

* **expressify:** the __ow_body doesn't need to be decoded manually anymore

# [0.9.0](https://github.com/adobe/openwhisk-action-builder/compare/v0.8.0...v0.9.0) (2019-05-09)


### Features

* **builder:** allow extension of webpack config ([0e03766](https://github.com/adobe/openwhisk-action-builder/commit/0e03766)), closes [#30](https://github.com/adobe/openwhisk-action-builder/issues/30)

# [0.8.0](https://github.com/adobe/openwhisk-action-builder/compare/v0.7.0...v0.8.0) (2019-04-26)


### Features

* **cli:** add default externals for node:10 container ([#28](https://github.com/adobe/openwhisk-action-builder/issues/28)) ([28daad1](https://github.com/adobe/openwhisk-action-builder/commit/28daad1)), closes [#27](https://github.com/adobe/openwhisk-action-builder/issues/27)

# [0.7.0](https://github.com/adobe/openwhisk-action-builder/compare/v0.6.0...v0.7.0) (2019-04-18)


### Features

* **config:** support to specify file content in env variables ([#25](https://github.com/adobe/openwhisk-action-builder/issues/25)) ([e47f0e2](https://github.com/adobe/openwhisk-action-builder/commit/e47f0e2)), closes [#22](https://github.com/adobe/openwhisk-action-builder/issues/22)

# [0.6.0](https://github.com/adobe/openwhisk-action-builder/compare/v0.5.4...v0.6.0) (2019-04-17)


### Features

* **cli:** allow to create or update openwhisk package ([721b590](https://github.com/adobe/openwhisk-action-builder/commit/721b590)), closes [#23](https://github.com/adobe/openwhisk-action-builder/issues/23)

## [0.5.4](https://github.com/adobe/openwhisk-action-builder/compare/v0.5.3...v0.5.4) (2019-04-08)


### Bug Fixes

* **cli:** correct usage of yargs ([53195be](https://github.com/adobe/openwhisk-action-builder/commit/53195be))

## [0.5.3](https://github.com/adobe/openwhisk-action-builder/compare/v0.5.2...v0.5.3) (2019-04-03)


### Bug Fixes

* **cli:** default to nodejs:10 container ([19a0c3d](https://github.com/adobe/openwhisk-action-builder/commit/19a0c3d)), closes [#18](https://github.com/adobe/openwhisk-action-builder/issues/18)

## [0.5.2](https://github.com/adobe/openwhisk-action-builder/compare/v0.5.1...v0.5.2) (2019-04-01)


### Bug Fixes

* **expressify:** send body as raw data ([#17](https://github.com/adobe/openwhisk-action-builder/issues/17)) ([157e88c](https://github.com/adobe/openwhisk-action-builder/commit/157e88c)), closes [#16](https://github.com/adobe/openwhisk-action-builder/issues/16)

## [0.5.1](https://github.com/adobe/openwhisk-action-builder/compare/v0.5.0...v0.5.1) (2019-03-25)


### Bug Fixes

* **express:** ensure req.body is a string ([c40897a](https://github.com/adobe/openwhisk-action-builder/commit/c40897a)), closes [#15](https://github.com/adobe/openwhisk-action-builder/issues/15)

# [0.5.0](https://github.com/adobe/openwhisk-action-builder/compare/v0.4.1...v0.5.0) (2019-03-25)


### Features

* **api:** add new expressify helper to support serverless-http ([#14](https://github.com/adobe/openwhisk-action-builder/issues/14)) ([50dbae3](https://github.com/adobe/openwhisk-action-builder/commit/50dbae3)), closes [#13](https://github.com/adobe/openwhisk-action-builder/issues/13)

## [0.4.1](https://github.com/adobe/openwhisk-action-builder/compare/v0.4.0...v0.4.1) (2019-03-22)


### Bug Fixes

* **logging:** move log helpers to own export ([#12](https://github.com/adobe/openwhisk-action-builder/issues/12)) ([01a44b4](https://github.com/adobe/openwhisk-action-builder/commit/01a44b4))

# [0.4.0](https://github.com/adobe/openwhisk-action-builder/compare/v0.3.0...v0.4.0) (2019-03-22)


### Features

* **logging:** Adding logging helpers ([#11](https://github.com/adobe/openwhisk-action-builder/issues/11)) ([c1e5d50](https://github.com/adobe/openwhisk-action-builder/commit/c1e5d50)), closes [#9](https://github.com/adobe/openwhisk-action-builder/issues/9)
