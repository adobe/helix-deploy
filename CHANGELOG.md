## [1.8.1](https://github.com/adobe/helix-deploy/compare/v1.8.0...v1.8.1) (2020-12-18)


### Bug Fixes

* **aws:** use different role for integration tests ([9741376](https://github.com/adobe/helix-deploy/commit/97413761b78c63386c386a2cd0ff32de928d3f6a))

# [1.8.0](https://github.com/adobe/helix-deploy/compare/v1.7.1...v1.8.0) (2020-12-17)


### Features

* **adapter:** instrument epsagon ([#26](https://github.com/adobe/helix-deploy/issues/26)) ([ef9cfb2](https://github.com/adobe/helix-deploy/commit/ef9cfb2bbc2c7025f0a7cac633ed6898eb00be69))

## [1.7.1](https://github.com/adobe/helix-deploy/compare/v1.7.0...v1.7.1) (2020-12-17)


### Bug Fixes

* **aws:** use hash function to generate consistent statement ids ([62ebf23](https://github.com/adobe/helix-deploy/commit/62ebf23d0523dae63ba13f98f8e60fc7f7ee95c8)), closes [#24](https://github.com/adobe/helix-deploy/issues/24)

# [1.7.0](https://github.com/adobe/helix-deploy/compare/v1.6.0...v1.7.0) (2020-12-16)


### Features

* **cli:** improve deployer selection ([7ff6d76](https://github.com/adobe/helix-deploy/commit/7ff6d760769e3cdb150e12eb89143d49178a15f6)), closes [#18](https://github.com/adobe/helix-deploy/issues/18)

# [1.6.0](https://github.com/adobe/helix-deploy/compare/v1.5.0...v1.6.0) (2020-12-16)


### Features

* **build:** combine wrapper and action into 1 bundle ([#21](https://github.com/adobe/helix-deploy/issues/21)) ([c3b4258](https://github.com/adobe/helix-deploy/commit/c3b4258f28cfd11652f95cc60932ee9646676f8c))

# [1.5.0](https://github.com/adobe/helix-deploy/compare/v1.4.0...v1.5.0) (2020-12-15)


### Bug Fixes

* **aws:** add route for requests with suffix ([a3240ac](https://github.com/adobe/helix-deploy/commit/a3240ac3d930aef392cdb7111b256f37ec52019f)), closes [#13](https://github.com/adobe/helix-deploy/issues/13)
* **aws:** dependency list not valid tag value ([03172a2](https://github.com/adobe/helix-deploy/commit/03172a2e0d593e6b89a7aafc02b8b4d370761f17)), closes [#12](https://github.com/adobe/helix-deploy/issues/12)
* **deploy:** allow each deployer to specify test ([b004fe4](https://github.com/adobe/helix-deploy/commit/b004fe422ae586582e8bdb4a0291531e83b5fb8d)), closes [#10](https://github.com/adobe/helix-deploy/issues/10)


### Features

* **adapter:** include suffix / __ow_path in context ([21e4e2c](https://github.com/adobe/helix-deploy/commit/21e4e2c6e439942a18c88dee735561e2a57d0f31)), closes [#17](https://github.com/adobe/helix-deploy/issues/17)

# [1.4.0](https://github.com/adobe/helix-deploy/compare/v1.3.0...v1.4.0) (2020-12-14)


### Features

* **aws:** add package parameters to ssm ([d8b2cb7](https://github.com/adobe/helix-deploy/commit/d8b2cb71642bef10d7553b8c51c28af0bfcbc765))
* **aws:** add secrets from secret store at runtime ([6310ba8](https://github.com/adobe/helix-deploy/commit/6310ba887638d8ee417a7508ebb3f8629c2e558a))
* **aws:** set package parameters using SSM ([d76b59b](https://github.com/adobe/helix-deploy/commit/d76b59bc2a4e8dee6ed119cc3735ba6cc332be80))

# [1.3.0](https://github.com/adobe/helix-deploy/compare/v1.2.0...v1.3.0) (2020-12-12)


### Features

* **aws:** reuse existing api and integration ([8ee9e10](https://github.com/adobe/helix-deploy/commit/8ee9e10a2c8598fe41d4856b45eb00b4b29b8993)), closes [#4](https://github.com/adobe/helix-deploy/issues/4)

# [1.2.0](https://github.com/adobe/helix-deploy/compare/v1.1.0...v1.2.0) (2020-12-11)


### Features

* **azure:** deploy to azure and set package params ([39d8e9a](https://github.com/adobe/helix-deploy/commit/39d8e9adf90e5718b5b7abd851222aca26cf1573))
* **azure:** enable setting function parameters ([61d2f53](https://github.com/adobe/helix-deploy/commit/61d2f53abbb4ab358b2e89d02d086a4ae645bdb8))

# [1.1.0](https://github.com/adobe/helix-deploy/compare/v1.0.1...v1.1.0) (2020-12-11)


### Features

* **deploy:** allow to deploy to select targets ([ecd946a](https://github.com/adobe/helix-deploy/commit/ecd946a8706689af8a647bedba96345a91669d39))

## [1.0.1](https://github.com/adobe/helix-deploy/compare/v1.0.0...v1.0.1) (2020-12-11)


### Bug Fixes

* **aws:** deployer doesn't work ([b06ea26](https://github.com/adobe/helix-deploy/commit/b06ea264eeeeeccd77de8ee8b9fd8faa55d7178f))

# 1.0.0 (2020-12-10)


### Bug Fixes

* **aws:** do not init when no region has been set ([fa50b3e](https://github.com/adobe/helix-deploy/commit/fa50b3ebc8bad77142776a3e71d113a1330cc6aa))
* **build:** fix module resolution order (fixes [#84](https://github.com/adobe/helix-deploy/issues/84)) ([#85](https://github.com/adobe/helix-deploy/issues/85)) ([8390a95](https://github.com/adobe/helix-deploy/commit/8390a9536a4737046b598bef172e88f62d3f1a04))
* **build:** instruct webpack to use correct __dirname ([#47](https://github.com/adobe/helix-deploy/issues/47)) ([36d9242](https://github.com/adobe/helix-deploy/commit/36d9242bfa8a7f51c404d141413115699fb9b541)), closes [#39](https://github.com/adobe/helix-deploy/issues/39)
* **build:** only validate bundle if it's built (fixes [#77](https://github.com/adobe/helix-deploy/issues/77)) ([#79](https://github.com/adobe/helix-deploy/issues/79)) ([3c62bfd](https://github.com/adobe/helix-deploy/commit/3c62bfdbb10f456716c4057f6c1c61ff7331ce19))
* **build:** write all output to stderr and generate JSON to stdout. ([#72](https://github.com/adobe/helix-deploy/issues/72)) ([44694c7](https://github.com/adobe/helix-deploy/commit/44694c725a69405423e81d65913f9d21e73e854e)), closes [#35](https://github.com/adobe/helix-deploy/issues/35) [#71](https://github.com/adobe/helix-deploy/issues/71)
* **builder:** add namespace to __OW_NAMESPACE ([3e21357](https://github.com/adobe/helix-deploy/commit/3e21357dce8b0e2891d12d6327e9a8fd8846db92))
* **builder:** add option to specify specify link package name ([#66](https://github.com/adobe/helix-deploy/issues/66)) ([c0ae740](https://github.com/adobe/helix-deploy/commit/c0ae7406a62453912277f7a9a9463b23e82d4b63))
* **builder:** add support for static file renaming and directories. ([bce8f31](https://github.com/adobe/helix-deploy/commit/bce8f316873204607c04771ed0bfd8de0f46c573)), closes [#6](https://github.com/adobe/helix-deploy/issues/6)
* **builder:** correct output on deploy ([#118](https://github.com/adobe/helix-deploy/issues/118)) ([380ff1a](https://github.com/adobe/helix-deploy/commit/380ff1a144244f242e0a1db64d3bb50e962036f2)), closes [#113](https://github.com/adobe/helix-deploy/issues/113)
* **builder:** ensure non 0 exit code with failed tests (fixes [#74](https://github.com/adobe/helix-deploy/issues/74)) ([c496487](https://github.com/adobe/helix-deploy/commit/c496487b5c180fd1a00bd33c0c6ebfcfa7c94484))
* **builder:** fix error when linking with [@ci](https://github.com/ci) ([02a47a5](https://github.com/adobe/helix-deploy/commit/02a47a5e586cc585a8e6970c447b7d29c2d68963))
* **builder:** make updated-by optional ([#148](https://github.com/adobe/helix-deploy/issues/148)) ([1f8d88a](https://github.com/adobe/helix-deploy/commit/1f8d88a6682b57816ea3528fa0cfb853bdf17b26))
* **builder:** remove externals that are not really present ([61bbaa8](https://github.com/adobe/helix-deploy/commit/61bbaa8329c46990a6c0e912e90b070f059f156e))
* **builder:** set process.exitCode on failure ([35c7dbd](https://github.com/adobe/helix-deploy/commit/35c7dbdd91363e42e7b2f51f01367b0e58cbdd9d)), closes [#34](https://github.com/adobe/helix-deploy/issues/34)
* **builder:** signal error during sequence updates ([d239066](https://github.com/adobe/helix-deploy/commit/d239066e1e4b3533f11f9c94714aff99f9dcab35)), closes [#53](https://github.com/adobe/helix-deploy/issues/53)
* **cli:** correct usage of yargs ([53195be](https://github.com/adobe/helix-deploy/commit/53195be1f7bfa356a7132fec0c7b6a6df21645a4))
* **cli:** default to nodejs:10 container ([19a0c3d](https://github.com/adobe/helix-deploy/commit/19a0c3d8f1945a600f328feae3e6fbbee51f475d)), closes [#18](https://github.com/adobe/helix-deploy/issues/18)
* **cli:** prefer process.env over .wskprops ([#46](https://github.com/adobe/helix-deploy/issues/46)) ([c9eb849](https://github.com/adobe/helix-deploy/commit/c9eb849343a6f0a387f74a88696b64df30290842)), closes [#42](https://github.com/adobe/helix-deploy/issues/42)
* **dep:** update dependencies ([53878a0](https://github.com/adobe/helix-deploy/commit/53878a011c35f433fff0333bfae70852a08e0421))
* **deploy:** force deployment as raw web action in openwhisk ([a6db7a6](https://github.com/adobe/helix-deploy/commit/a6db7a64ff966e865d4b9f32c1da3cbcb8ec4ca1))
* **deploy:** report correct action package ([999af39](https://github.com/adobe/helix-deploy/commit/999af39a70f289ade3f3ce07c288af35ed5ffb51)), closes [#109](https://github.com/adobe/helix-deploy/issues/109)
* **deps:** re-add missing semantic release plugin ([e536056](https://github.com/adobe/helix-deploy/commit/e536056a293c8b97cc8ee15bb1065ed5f7690262))
* **deps:** update dependency chalk to v4 ([#130](https://github.com/adobe/helix-deploy/issues/130)) ([33cb7d0](https://github.com/adobe/helix-deploy/commit/33cb7d09f337d1ac31fa32a2676ddafe25667071))
* **deps:** update dependency fs-extra to v9 ([#127](https://github.com/adobe/helix-deploy/issues/127)) ([e430bb1](https://github.com/adobe/helix-deploy/commit/e430bb181246e6774bdaf1bfac910b1a864ddf3a))
* **deps:** update dependency isomorphic-git to v1.7.1 ([#161](https://github.com/adobe/helix-deploy/issues/161)) ([a593bc8](https://github.com/adobe/helix-deploy/commit/a593bc80a2d4d7398bbbc6061070a0461546ada1))
* **deps:** update dependency semver to v7 ([#88](https://github.com/adobe/helix-deploy/issues/88)) ([04a44e1](https://github.com/adobe/helix-deploy/commit/04a44e1101c221fba3d0ec6b0d047b92e8dd2ffd))
* **deps:** update dependency yargs to v16 ([#177](https://github.com/adobe/helix-deploy/issues/177)) ([5a9d53b](https://github.com/adobe/helix-deploy/commit/5a9d53bba941e8741895495445fb6ce054ae9680))
* **deps:** update external ([#140](https://github.com/adobe/helix-deploy/issues/140)) ([b592138](https://github.com/adobe/helix-deploy/commit/b59213891a60e657d33717d710d78f9b4b6cc446))
* **deps:** update external ([#165](https://github.com/adobe/helix-deploy/issues/165)) ([77ea925](https://github.com/adobe/helix-deploy/commit/77ea925621666518b640f039d6ee3008b164dfd2))
* **deps:** update external ([#178](https://github.com/adobe/helix-deploy/issues/178)) ([45a6f78](https://github.com/adobe/helix-deploy/commit/45a6f781aa49c3947a22b06c0226785cf8491d89))
* **deps:** update external ([#81](https://github.com/adobe/helix-deploy/issues/81)) ([5813343](https://github.com/adobe/helix-deploy/commit/5813343b9c6e3818dcae7d3d1a4b49c361155c56))
* **empty:** trigger release ([973f042](https://github.com/adobe/helix-deploy/commit/973f042c053ab4e6004b293453757b7c44b5ceaf))
* **express:** ensure req.body is a string ([c40897a](https://github.com/adobe/helix-deploy/commit/c40897af5995b63d3174cabc909e53c39fd7f871)), closes [#15](https://github.com/adobe/helix-deploy/issues/15)
* **expressify:** fallback to application/octet-stream if no content-type provided ([8d69dcc](https://github.com/adobe/helix-deploy/commit/8d69dcc1ad7b650ae5626bc20cc80491087bb563))
* **expressify:** send body as raw data ([#17](https://github.com/adobe/helix-deploy/issues/17)) ([157e88c](https://github.com/adobe/helix-deploy/commit/157e88c6cfd834860515dfd396edbbe446a0d085)), closes [#16](https://github.com/adobe/helix-deploy/issues/16)
* **external:** declare all openwhisk files as external ([2271598](https://github.com/adobe/helix-deploy/commit/2271598b475dc5b0415b9f60738ba955504c97d1)), closes [#54](https://github.com/adobe/helix-deploy/issues/54)
* **link:** annotations in sequences are not updated correctly ([#144](https://github.com/adobe/helix-deploy/issues/144)) ([fec7f7e](https://github.com/adobe/helix-deploy/commit/fec7f7ecc25b4c862b5a797c0ee349a84a16c47b))
* **logging:** move log helpers to own export ([#12](https://github.com/adobe/helix-deploy/issues/12)) ([01a44b4](https://github.com/adobe/helix-deploy/commit/01a44b44004d6772f8368047560eb52ba03493c0))
* **openwhisk:** fix wrapper entry point ([12b7120](https://github.com/adobe/helix-deploy/commit/12b7120e062bde10fc79c9748f3d93cae1e96a1a))
* **package:** update fs-extra to version 8.0.0 ([fd2869d](https://github.com/adobe/helix-deploy/commit/fd2869da623a00d9adee02d7f87a93f7c408ed5b))
* **params:** ignore WSK_xxx in params ([#110](https://github.com/adobe/helix-deploy/issues/110)) ([f543aeb](https://github.com/adobe/helix-deploy/commit/f543aeb24e8d4679626d724d77bc0fdfebe24915))
* **server:** dev-params should win over package params ([#189](https://github.com/adobe/helix-deploy/issues/189)) ([53c8afb](https://github.com/adobe/helix-deploy/commit/53c8afb9cb77a0d3f6ce4eb3f01b409e3f0ee1e4)), closes [#188](https://github.com/adobe/helix-deploy/issues/188)


### Code Refactoring

* **lib:** extract helper to own package ([#60](https://github.com/adobe/helix-deploy/issues/60)) ([de04fcd](https://github.com/adobe/helix-deploy/commit/de04fcd4e96bb69f60dbec1c19e216daea5b0bcc))
* **project:** rename to helix-deploy/`hedy` ([d8d503a](https://github.com/adobe/helix-deploy/commit/d8d503a66661240711ce3fe3c3ec36d66f7636af))


### Features

* **api:** add new expressify helper to support serverless-http ([#14](https://github.com/adobe/helix-deploy/issues/14)) ([50dbae3](https://github.com/adobe/helix-deploy/commit/50dbae3d9d782da80871e838f8e0bdcb5e9d601d)), closes [#13](https://github.com/adobe/helix-deploy/issues/13)
* **archive:** add multicloud wrapper to archive ([bb3d4b0](https://github.com/adobe/helix-deploy/commit/bb3d4b0dc24f41cfd789e0ef20163faba205d8d3))
* **aws:** add AWS deployer ([717a095](https://github.com/adobe/helix-deploy/commit/717a09517d1c08e91bebc82efa0eb36e6994a969))
* **aws:** create api gateway with integration, routes and permissions ([9fd6b3b](https://github.com/adobe/helix-deploy/commit/9fd6b3b7cea2c00faa4ffe4ee54c7f28a2c5373d))
* **aws:** deploy to lambda and create version tags ([2686c41](https://github.com/adobe/helix-deploy/commit/2686c41c25be2d64e633cdca7c25b8e239bc0a8a))
* **aws:** upload file to temporary s3 bucket ([b845f90](https://github.com/adobe/helix-deploy/commit/b845f900c3f5be80cae44011662e916e2b8cfa49))
* **builder:** add --test-params for testing wsk actions ([b805047](https://github.com/adobe/helix-deploy/commit/b8050478f31b16ef230bc8e677ffbac846e38acf)), closes [#102](https://github.com/adobe/helix-deploy/issues/102)
* **builder:** add option to generate link to [@ci](https://github.com/ci) ([#56](https://github.com/adobe/helix-deploy/issues/56)) ([8d1ae73](https://github.com/adobe/helix-deploy/commit/8d1ae73dafdb4e00a6626fe041a0c0ea25ec91c9))
* **builder:** add options for --web-secure ([#65](https://github.com/adobe/helix-deploy/issues/65)) ([dba7639](https://github.com/adobe/helix-deploy/commit/dba76395cdfe903c3f053b5649c49bdbfa9cab0f))
* **builder:** add possibility to specify test url ([e450a85](https://github.com/adobe/helix-deploy/commit/e450a85054fd9878ad97a2877bfa0918067bb7b3)), closes [#51](https://github.com/adobe/helix-deploy/issues/51)
* **builder:** add timestamp and delete command ([d3ed7ec](https://github.com/adobe/helix-deploy/commit/d3ed7ec78bf9b57448c926bf89473367e27d9bf9)), closes [#145](https://github.com/adobe/helix-deploy/issues/145) [#138](https://github.com/adobe/helix-deploy/issues/138)
* **builder:** allow extension of webpack config ([0e03766](https://github.com/adobe/helix-deploy/commit/0e0376632525c6ee8b7babbf2dad2b2fb7d4a620)), closes [#30](https://github.com/adobe/helix-deploy/issues/30)
* **builder:** create option to create symlinks ([fbf37e4](https://github.com/adobe/helix-deploy/commit/fbf37e463151c6c42ee8d5171469a852fbfad716)), closes [#48](https://github.com/adobe/helix-deploy/issues/48)
* **builder:** display nicer error message if openwhisk creds are missing ([2a2ef39](https://github.com/adobe/helix-deploy/commit/2a2ef39278a3b00a4dad37a1a421889e552a2fa1)), closes [#103](https://github.com/adobe/helix-deploy/issues/103)
* **builder:** don't restict links (fixes [#73](https://github.com/adobe/helix-deploy/issues/73)) ([06c8f53](https://github.com/adobe/helix-deploy/commit/06c8f53ae2f3bca58de2fd61b971086dbc0a9b1f))
* **builder:** ensure that web-secure works correctly ([#125](https://github.com/adobe/helix-deploy/issues/125)) ([17f9530](https://github.com/adobe/helix-deploy/commit/17f9530741705c03618df4befe36a69aceedded4)), closes [#124](https://github.com/adobe/helix-deploy/issues/124)
* **builder:** record dependencies as annotations ([#131](https://github.com/adobe/helix-deploy/issues/131)) ([01e3527](https://github.com/adobe/helix-deploy/commit/01e35272b170bf4704c3c9b02a96a8c6d368ea4b)), closes [#121](https://github.com/adobe/helix-deploy/issues/121)
* **builder:** Support WSK_CONFIG_FILE environment variable ([#92](https://github.com/adobe/helix-deploy/issues/92)) ([629e09f](https://github.com/adobe/helix-deploy/commit/629e09f45e73e499dd74215b63fa96e6dc4d9d06))
* **builder:** use helix-fetch instead of request ([#158](https://github.com/adobe/helix-deploy/issues/158)) ([b94ef77](https://github.com/adobe/helix-deploy/commit/b94ef77d9db1395a20893cd530a8a8611a607e95)), closes [#157](https://github.com/adobe/helix-deploy/issues/157)
* **builder:** use version from package json in action name ([3717eca](https://github.com/adobe/helix-deploy/commit/3717ecaec4310be3f98f3b21d5a622f076b67557)), closes [#49](https://github.com/adobe/helix-deploy/issues/49)
* **builder:** validate bundle before deploying (fixes [#76](https://github.com/adobe/helix-deploy/issues/76)) ([a049536](https://github.com/adobe/helix-deploy/commit/a049536e1f4ade9b4ffab52aaa170509e4f958b7))
* **cli:** add default externals for node:10 container ([#28](https://github.com/adobe/helix-deploy/issues/28)) ([28daad1](https://github.com/adobe/helix-deploy/commit/28daad1ed01d66ffe74eaba2e5204192b1b745d0)), closes [#27](https://github.com/adobe/helix-deploy/issues/27)
* **cli:** add support for --memory and --concurrency ([#171](https://github.com/adobe/helix-deploy/issues/171)) ([4a1314e](https://github.com/adobe/helix-deploy/commit/4a1314ee033a356617d68904a4547fdbab4748c7))
* **cli:** allow to create or update openwhisk package ([721b590](https://github.com/adobe/helix-deploy/commit/721b590c3dc42d6765b39fb5b52e1576f2e345bc)), closes [#23](https://github.com/adobe/helix-deploy/issues/23)
* **cli:** bundled package.json should have version set to host package version ([dccaf27](https://github.com/adobe/helix-deploy/commit/dccaf27bd028dc7a36a0444c4f54051e06929538)), closes [#5](https://github.com/adobe/helix-deploy/issues/5)
* **cli:** package parameter-file should only be required on package … ([#185](https://github.com/adobe/helix-deploy/issues/185)) ([14e7d43](https://github.com/adobe/helix-deploy/commit/14e7d4364901d2656a985674317451fd50789784)), closes [#184](https://github.com/adobe/helix-deploy/issues/184)
* **config:** support to specify file content in env variables ([#25](https://github.com/adobe/helix-deploy/issues/25)) ([e47f0e2](https://github.com/adobe/helix-deploy/commit/e47f0e22e47a83282e4133959e7c71ab7e67b6e0)), closes [#22](https://github.com/adobe/helix-deploy/issues/22)
* **deploy:** provide security measure to prevent deployment to wrong namespace ([ed47697](https://github.com/adobe/helix-deploy/commit/ed47697a9d3b029ab1734d652a8724f5f032a5cc)), closes [#93](https://github.com/adobe/helix-deploy/issues/93)
* **deps:** improve dependency resolution ([#135](https://github.com/adobe/helix-deploy/issues/135)) ([a74e079](https://github.com/adobe/helix-deploy/commit/a74e079a768ffc63cf0575cee6dcb69c059c09cb)), closes [#134](https://github.com/adobe/helix-deploy/issues/134)
* **dev:** implement development server fixes [#96](https://github.com/adobe/helix-deploy/issues/96) ([#97](https://github.com/adobe/helix-deploy/issues/97)) ([c9df2c0](https://github.com/adobe/helix-deploy/commit/c9df2c0b5aa6098919de61642fc49036d6cf27c0))
* **expressify:** set isBase64Encoded flag correctly to ensure proper decoding ([e555c6e](https://github.com/adobe/helix-deploy/commit/e555c6e1ee028db220f7d17811a58ff25de15b16))
* **logging:** Adding logging helpers ([#11](https://github.com/adobe/helix-deploy/issues/11)) ([c1e5d50](https://github.com/adobe/helix-deploy/commit/c1e5d504a897959a62ec43ca1bcc7176aec030cc)), closes [#9](https://github.com/adobe/helix-deploy/issues/9)
* **multicloud:** add wrapper template ([745cc2e](https://github.com/adobe/helix-deploy/commit/745cc2e42df14e76747a9906cf4985e78e8bffad))
* **openwhisk:** add new `--timeout` limit option ([936880d](https://github.com/adobe/helix-deploy/commit/936880da18dd1e155c0ba0a2c57b841c6968fefa)), closes [#37](https://github.com/adobe/helix-deploy/issues/37)
* **params:** add support for nested action and package params ([#68](https://github.com/adobe/helix-deploy/issues/68)) ([3d0619b](https://github.com/adobe/helix-deploy/commit/3d0619b040f2d4d90e2a8a8e7176d7476e8b11c0)), closes [#67](https://github.com/adobe/helix-deploy/issues/67)
* **server:** add dev-params-file support ([b5ba20c](https://github.com/adobe/helix-deploy/commit/b5ba20c0b94ec94e2a808241ca8c1494261c9525))


### BREAKING CHANGES

* **project:** new expanded scope for the project, this is now multi-cloud. The legacy version can still be found here: https://github.com/adobe/openwhisk-action-builder
* **deploy:** The options `--web-export` and `--raw-http` have been removed as all actions will now be deployed to OpenWhisk as raw web actions
* **lib:** logging and expressify are no longer exported by this package. use @adobe/openwhisk-action-utils instead.
* **expressify:** the __ow_body doesn't need to be decoded manually anymore

## [2.15.1](https://github.com/adobe/openwhisk-action-builder/compare/v2.15.0...v2.15.1) (2020-11-12)


### Bug Fixes

* **server:** dev-params should win over package params ([#189](https://github.com/adobe/openwhisk-action-builder/issues/189)) ([53c8afb](https://github.com/adobe/openwhisk-action-builder/commit/53c8afb9cb77a0d3f6ce4eb3f01b409e3f0ee1e4)), closes [#188](https://github.com/adobe/openwhisk-action-builder/issues/188)

# [2.15.0](https://github.com/adobe/openwhisk-action-builder/compare/v2.14.2...v2.15.0) (2020-10-23)


### Features

* **cli:** package parameter-file should only be required on package … ([#185](https://github.com/adobe/openwhisk-action-builder/issues/185)) ([14e7d43](https://github.com/adobe/openwhisk-action-builder/commit/14e7d4364901d2656a985674317451fd50789784)), closes [#184](https://github.com/adobe/openwhisk-action-builder/issues/184)

## [2.14.2](https://github.com/adobe/openwhisk-action-builder/compare/v2.14.1...v2.14.2) (2020-09-21)


### Bug Fixes

* **deps:** update external ([#178](https://github.com/adobe/openwhisk-action-builder/issues/178)) ([45a6f78](https://github.com/adobe/openwhisk-action-builder/commit/45a6f781aa49c3947a22b06c0226785cf8491d89))

## [2.14.1](https://github.com/adobe/openwhisk-action-builder/compare/v2.14.0...v2.14.1) (2020-09-14)


### Bug Fixes

* **deps:** update dependency yargs to v16 ([#177](https://github.com/adobe/openwhisk-action-builder/issues/177)) ([5a9d53b](https://github.com/adobe/openwhisk-action-builder/commit/5a9d53bba941e8741895495445fb6ce054ae9680))

# [2.14.0](https://github.com/adobe/openwhisk-action-builder/compare/v2.13.2...v2.14.0) (2020-08-27)


### Features

* **cli:** add support for --memory and --concurrency ([#171](https://github.com/adobe/openwhisk-action-builder/issues/171)) ([4a1314e](https://github.com/adobe/openwhisk-action-builder/commit/4a1314ee033a356617d68904a4547fdbab4748c7))

## [2.13.2](https://github.com/adobe/openwhisk-action-builder/compare/v2.13.1...v2.13.2) (2020-07-27)


### Bug Fixes

* **deps:** update external ([#165](https://github.com/adobe/openwhisk-action-builder/issues/165)) ([77ea925](https://github.com/adobe/openwhisk-action-builder/commit/77ea925621666518b640f039d6ee3008b164dfd2))

## [2.13.1](https://github.com/adobe/openwhisk-action-builder/compare/v2.13.0...v2.13.1) (2020-07-13)


### Bug Fixes

* **deps:** update dependency isomorphic-git to v1.7.1 ([#161](https://github.com/adobe/openwhisk-action-builder/issues/161)) ([a593bc8](https://github.com/adobe/openwhisk-action-builder/commit/a593bc80a2d4d7398bbbc6061070a0461546ada1))

# [2.13.0](https://github.com/adobe/openwhisk-action-builder/compare/v2.12.0...v2.13.0) (2020-07-01)


### Features

* **builder:** use helix-fetch instead of request ([#158](https://github.com/adobe/openwhisk-action-builder/issues/158)) ([b94ef77](https://github.com/adobe/openwhisk-action-builder/commit/b94ef77d9db1395a20893cd530a8a8611a607e95)), closes [#157](https://github.com/adobe/openwhisk-action-builder/issues/157)

# [2.12.0](https://github.com/adobe/openwhisk-action-builder/compare/v2.11.1...v2.12.0) (2020-06-04)


### Features

* **server:** add dev-params-file support ([b5ba20c](https://github.com/adobe/openwhisk-action-builder/commit/b5ba20c0b94ec94e2a808241ca8c1494261c9525))

## [2.11.1](https://github.com/adobe/openwhisk-action-builder/compare/v2.11.0...v2.11.1) (2020-06-02)


### Bug Fixes

* **builder:** make updated-by optional ([#148](https://github.com/adobe/openwhisk-action-builder/issues/148)) ([1f8d88a](https://github.com/adobe/openwhisk-action-builder/commit/1f8d88a6682b57816ea3528fa0cfb853bdf17b26))

# [2.11.0](https://github.com/adobe/openwhisk-action-builder/compare/v2.10.2...v2.11.0) (2020-06-01)


### Features

* **builder:** add timestamp and delete command ([d3ed7ec](https://github.com/adobe/openwhisk-action-builder/commit/d3ed7ec78bf9b57448c926bf89473367e27d9bf9)), closes [#145](https://github.com/adobe/openwhisk-action-builder/issues/145) [#138](https://github.com/adobe/openwhisk-action-builder/issues/138)

## [2.10.2](https://github.com/adobe/openwhisk-action-builder/compare/v2.10.1...v2.10.2) (2020-05-27)


### Bug Fixes

* **link:** annotations in sequences are not updated correctly ([#144](https://github.com/adobe/openwhisk-action-builder/issues/144)) ([fec7f7e](https://github.com/adobe/openwhisk-action-builder/commit/fec7f7ecc25b4c862b5a797c0ee349a84a16c47b))

## [2.10.1](https://github.com/adobe/openwhisk-action-builder/compare/v2.10.0...v2.10.1) (2020-05-04)


### Bug Fixes

* **deps:** update external ([#140](https://github.com/adobe/openwhisk-action-builder/issues/140)) ([b592138](https://github.com/adobe/openwhisk-action-builder/commit/b59213891a60e657d33717d710d78f9b4b6cc446))

# [2.10.0](https://github.com/adobe/openwhisk-action-builder/compare/v2.9.0...v2.10.0) (2020-04-16)


### Features

* **deps:** improve dependency resolution ([#135](https://github.com/adobe/openwhisk-action-builder/issues/135)) ([a74e079](https://github.com/adobe/openwhisk-action-builder/commit/a74e079a768ffc63cf0575cee6dcb69c059c09cb)), closes [#134](https://github.com/adobe/openwhisk-action-builder/issues/134)

# [2.9.0](https://github.com/adobe/openwhisk-action-builder/compare/v2.8.2...v2.9.0) (2020-04-13)


### Features

* **builder:** record dependencies as annotations ([#131](https://github.com/adobe/openwhisk-action-builder/issues/131)) ([01e3527](https://github.com/adobe/openwhisk-action-builder/commit/01e35272b170bf4704c3c9b02a96a8c6d368ea4b)), closes [#121](https://github.com/adobe/openwhisk-action-builder/issues/121)

## [2.8.2](https://github.com/adobe/openwhisk-action-builder/compare/v2.8.1...v2.8.2) (2020-04-06)


### Bug Fixes

* **deps:** update dependency chalk to v4 ([#130](https://github.com/adobe/openwhisk-action-builder/issues/130)) ([33cb7d0](https://github.com/adobe/openwhisk-action-builder/commit/33cb7d09f337d1ac31fa32a2676ddafe25667071))

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
