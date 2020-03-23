## [2.8.1](https://github.com/adobe/openwhisk-action-builder/compare/v2.8.0...v2.8.1) (2020-03-23)


### Bug Fixes

* **deps:** update dependency fs-extra to v9 ([#127](https://github.com/adobe/openwhisk-action-builder/issues/127)) ([e430bb1](https://github.com/adobe/openwhisk-action-builder/commit/e430bb181246e6774bdaf1bfac910b1a864ddf3a))

# [2.8.0](https://github.com/adobe/openwhisk-action-builder/compare/v2.7.0...v2.8.0) (2020-03-17)


### Features

* **builder:** ensure that web-secure works correctly ([#125](https://github.com/adobe/openwhisk-action-builder/issues/125)) ([17f9530](https://github.com/adobe/openwhisk-action-builder/commit/17f9530741705c03618df4befe36a69aceedded4)), closes [#124](https://github.com/adobe/openwhisk-action-builder/issues/124)

# [2.7.0](https://github.com/adobe/openwhisk-action-builder/compare/v2.6.2...v2.7.0) (2020-03-09)


### Features

* **builder:** add --test-params for testing wsk actions ([b805047](https://github.com/adobe/openwhisk-action-builder/commit/b8050478f31b16ef230bc8e677ffbac846e38acf)), closes [#102](https://github.com/adobe/openwhisk-action-builder/issues/102)

## [2.6.2](https://github.com/adobe/openwhisk-action-builder/compare/v2.6.1...v2.6.2) (2020-02-28)


### Bug Fixes

* **builder:** correct output on deploy ([#118](https://github.com/adobe/openwhisk-action-builder/issues/118)) ([380ff1a](https://github.com/adobe/openwhisk-action-builder/commit/380ff1a144244f242e0a1db64d3bb50e962036f2)), closes [#113](https://github.com/adobe/openwhisk-action-builder/issues/113)

## [2.6.1](https://github.com/adobe/openwhisk-action-builder/compare/v2.6.0...v2.6.1) (2020-02-19)


### Bug Fixes

* **builder:** add namespace to __OW_NAMESPACE ([3e21357](https://github.com/adobe/openwhisk-action-builder/commit/3e21357dce8b0e2891d12d6327e9a8fd8846db92))

# [2.6.0](https://github.com/adobe/openwhisk-action-builder/compare/v2.5.1...v2.6.0) (2020-02-07)


### Bug Fixes

* **builder:** add support for static file renaming and directories. ([bce8f31](https://github.com/adobe/openwhisk-action-builder/commit/bce8f316873204607c04771ed0bfd8de0f46c573)), closes [#6](https://github.com/adobe/openwhisk-action-builder/issues/6)
* **deploy:** report correct action package ([999af39](https://github.com/adobe/openwhisk-action-builder/commit/999af39a70f289ade3f3ce07c288af35ed5ffb51)), closes [#109](https://github.com/adobe/openwhisk-action-builder/issues/109)


### Features

* **builder:** display nicer error message if openwhisk creds are missing ([2a2ef39](https://github.com/adobe/openwhisk-action-builder/commit/2a2ef39278a3b00a4dad37a1a421889e552a2fa1)), closes [#103](https://github.com/adobe/openwhisk-action-builder/issues/103)
* **deploy:** provide security measure to prevent deployment to wrong namespace ([ed47697](https://github.com/adobe/openwhisk-action-builder/commit/ed47697a9d3b029ab1734d652a8724f5f032a5cc)), closes [#93](https://github.com/adobe/openwhisk-action-builder/issues/93)

## [2.5.1](https://github.com/adobe/openwhisk-action-builder/compare/v2.5.0...v2.5.1) (2020-02-06)


### Bug Fixes

* **params:** ignore WSK_xxx in params ([#110](https://github.com/adobe/openwhisk-action-builder/issues/110)) ([f543aeb](https://github.com/adobe/openwhisk-action-builder/commit/f543aeb24e8d4679626d724d77bc0fdfebe24915))

# [2.5.0](https://github.com/adobe/openwhisk-action-builder/compare/v2.4.0...v2.5.0) (2020-01-17)


### Features

* **dev:** implement development server fixes [#96](https://github.com/adobe/openwhisk-action-builder/issues/96) ([#97](https://github.com/adobe/openwhisk-action-builder/issues/97)) ([c9df2c0](https://github.com/adobe/openwhisk-action-builder/commit/c9df2c0b5aa6098919de61642fc49036d6cf27c0))

# [2.4.0](https://github.com/adobe/openwhisk-action-builder/compare/v2.3.4...v2.4.0) (2020-01-08)


### Features

* **builder:** Support WSK_CONFIG_FILE environment variable ([#92](https://github.com/adobe/openwhisk-action-builder/issues/92)) ([629e09f](https://github.com/adobe/openwhisk-action-builder/commit/629e09f45e73e499dd74215b63fa96e6dc4d9d06))

## [2.3.4](https://github.com/adobe/openwhisk-action-builder/compare/v2.3.3...v2.3.4) (2019-12-15)


### Bug Fixes

* **deps:** update dependency semver to v7 ([#88](https://github.com/adobe/openwhisk-action-builder/issues/88)) ([04a44e1](https://github.com/adobe/openwhisk-action-builder/commit/04a44e1101c221fba3d0ec6b0d047b92e8dd2ffd))

## [2.3.3](https://github.com/adobe/openwhisk-action-builder/compare/v2.3.2...v2.3.3) (2019-12-02)


### Bug Fixes

* **build:** fix module resolution order (fixes [#84](https://github.com/adobe/openwhisk-action-builder/issues/84)) ([#85](https://github.com/adobe/openwhisk-action-builder/issues/85)) ([8390a95](https://github.com/adobe/openwhisk-action-builder/commit/8390a9536a4737046b598bef172e88f62d3f1a04))
* **deps:** re-add missing semantic release plugin ([e536056](https://github.com/adobe/openwhisk-action-builder/commit/e536056a293c8b97cc8ee15bb1065ed5f7690262))

## [2.3.2](https://github.com/adobe/openwhisk-action-builder/compare/v2.3.1...v2.3.2) (2019-11-24)


### Bug Fixes

* **deps:** update external ([#81](https://github.com/adobe/openwhisk-action-builder/issues/81)) ([5813343](https://github.com/adobe/openwhisk-action-builder/commit/5813343))

## [2.3.1](https://github.com/adobe/openwhisk-action-builder/compare/v2.3.0...v2.3.1) (2019-11-20)


### Bug Fixes

* **build:** only validate bundle if it's built (fixes [#77](https://github.com/adobe/openwhisk-action-builder/issues/77)) ([#79](https://github.com/adobe/openwhisk-action-builder/issues/79)) ([3c62bfd](https://github.com/adobe/openwhisk-action-builder/commit/3c62bfd))

# [2.3.0](https://github.com/adobe/openwhisk-action-builder/compare/v2.2.2...v2.3.0) (2019-11-20)


### Bug Fixes

* **builder:** ensure non 0 exit code with failed tests (fixes [#74](https://github.com/adobe/openwhisk-action-builder/issues/74)) ([c496487](https://github.com/adobe/openwhisk-action-builder/commit/c496487))


### Features

* **builder:** don't restict links (fixes [#73](https://github.com/adobe/openwhisk-action-builder/issues/73)) ([06c8f53](https://github.com/adobe/openwhisk-action-builder/commit/06c8f53))
* **builder:** validate bundle before deploying (fixes [#76](https://github.com/adobe/openwhisk-action-builder/issues/76)) ([a049536](https://github.com/adobe/openwhisk-action-builder/commit/a049536))

## [2.2.2](https://github.com/adobe/openwhisk-action-builder/compare/v2.2.1...v2.2.2) (2019-11-13)


### Bug Fixes

* **build:** write all output to stderr and generate JSON to stdout. ([#72](https://github.com/adobe/openwhisk-action-builder/issues/72)) ([44694c7](https://github.com/adobe/openwhisk-action-builder/commit/44694c7)), closes [#35](https://github.com/adobe/openwhisk-action-builder/issues/35) [#71](https://github.com/adobe/openwhisk-action-builder/issues/71)

## [2.2.1](https://github.com/adobe/openwhisk-action-builder/compare/v2.2.0...v2.2.1) (2019-11-05)


### Bug Fixes

* **empty:** trigger release ([973f042](https://github.com/adobe/openwhisk-action-builder/commit/973f042))

# [2.2.0](https://github.com/adobe/openwhisk-action-builder/compare/v2.1.1...v2.2.0) (2019-11-05)


### Features

* **params:** add support for nested action and package params ([#68](https://github.com/adobe/openwhisk-action-builder/issues/68)) ([3d0619b](https://github.com/adobe/openwhisk-action-builder/commit/3d0619b)), closes [#67](https://github.com/adobe/openwhisk-action-builder/issues/67)

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
