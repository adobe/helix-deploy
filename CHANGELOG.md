# [4.5.0](https://github.com/adobe/helix-deploy/compare/v4.4.1...v4.5.0) (2021-05-07)


### Bug Fixes

* **google:** remove stray exit ([898694d](https://github.com/adobe/helix-deploy/commit/898694d441701eaa31af53d6d58fe1ca39b184f3))
* run cleanup earlier ([5b88238](https://github.com/adobe/helix-deploy/commit/5b88238fabaf08f8aa073015d6926e140e830252))
* **google:** actually run the cleanup from action builder ([935dfde](https://github.com/adobe/helix-deploy/commit/935dfde05fc50c0067fad4538ca932646a7cb10c))


### Features

* **cli:** add --cleanup-(ci|patch|minor|major) options ([87317a7](https://github.com/adobe/helix-deploy/commit/87317a7a4b5f3e6f3d27a6e6b35069a167036ff2)), closes [#232](https://github.com/adobe/helix-deploy/issues/232)
* **google:** allow specifying cleanup retention as count instead of time span ([4f3193e](https://github.com/adobe/helix-deploy/commit/4f3193ef90842ddccb0de48e65af8505b2888e7c)), closes [#232](https://github.com/adobe/helix-deploy/issues/232)
* **google:** run cleanup when enought parameters supplied ([e285f79](https://github.com/adobe/helix-deploy/commit/e285f794a0c2c0e03fe6c240644bd62c27fa35a3)), closes [#232](https://github.com/adobe/helix-deploy/issues/232)

## [4.4.1](https://github.com/adobe/helix-deploy/compare/v4.4.0...v4.4.1) (2021-05-06)


### Bug Fixes

* **dev:** ensure resolver works ([#249](https://github.com/adobe/helix-deploy/issues/249)) ([0268be5](https://github.com/adobe/helix-deploy/commit/0268be554908d7c46400f5f99c76bda68b2b6ed5))

# [4.4.0](https://github.com/adobe/helix-deploy/compare/v4.3.1...v4.4.0) (2021-05-05)


### Features

* decouple test from test url ([#247](https://github.com/adobe/helix-deploy/issues/247)) ([506f8ff](https://github.com/adobe/helix-deploy/commit/506f8ffda7252f7173999d4d04e6a0a21628ed4e))

## [4.3.1](https://github.com/adobe/helix-deploy/compare/v4.3.0...v4.3.1) (2021-05-04)


### Bug Fixes

* **dev:** fix development server to use universal action ([#246](https://github.com/adobe/helix-deploy/issues/246)) ([3a7ccff](https://github.com/adobe/helix-deploy/commit/3a7ccfff78bf651219d3e766c1998621142adbf6))

# [4.3.0](https://github.com/adobe/helix-deploy/compare/v4.2.0...v4.3.0) (2021-05-02)


### Features

* **build:** allow to specify the adapter file ([#242](https://github.com/adobe/helix-deploy/issues/242)) ([69eff0a](https://github.com/adobe/helix-deploy/commit/69eff0a7d609833a861138507236c085c9548178))

# [4.2.0](https://github.com/adobe/helix-deploy/compare/v4.1.2...v4.2.0) (2021-05-02)


### Features

* refactor to expose apis better ([9e8084a](https://github.com/adobe/helix-deploy/commit/9e8084a151fc5f603fd89b20a3885ca3af5ca781))

## [4.1.2](https://github.com/adobe/helix-deploy/compare/v4.1.1...v4.1.2) (2021-05-01)


### Bug Fixes

* **deps:** update external fixes ([4a30813](https://github.com/adobe/helix-deploy/commit/4a3081318e0319a321e0cae8549ba4cc18122a5b))

## [4.1.1](https://github.com/adobe/helix-deploy/compare/v4.1.0...v4.1.1) (2021-04-24)


### Bug Fixes

* **deps:** update external fixes ([70b14aa](https://github.com/adobe/helix-deploy/commit/70b14aa465e64b1ca0389fa5b4a679634e27fb05))

# [4.1.0](https://github.com/adobe/helix-deploy/compare/v4.0.7...v4.1.0) (2021-04-21)


### Features

* **esm:** add minimal esm support by using .cjs as bundle extension ([#229](https://github.com/adobe/helix-deploy/issues/229)) ([e876bed](https://github.com/adobe/helix-deploy/commit/e876bed6a6993684a4217846196ae243274f80e2))

## [4.0.7](https://github.com/adobe/helix-deploy/compare/v4.0.6...v4.0.7) (2021-04-20)


### Bug Fixes

* **gateway:** fix typo in log message ([6ae679e](https://github.com/adobe/helix-deploy/commit/6ae679ed27030ba7340cb59bfa8580716f562756))

## [4.0.6](https://github.com/adobe/helix-deploy/compare/v4.0.5...v4.0.6) (2021-04-19)


### Bug Fixes

* **google:** do not send a 302 for missing actions ([931d3cc](https://github.com/adobe/helix-deploy/commit/931d3cc620eb3d66537fdc42b3574bbec1d0bbf6))
* **google:** treat ? as a version string terminator ([ea60187](https://github.com/adobe/helix-deploy/commit/ea60187b25f4ee6af58dc815b36066f7c5e8da51))

## [4.0.5](https://github.com/adobe/helix-deploy/compare/v4.0.4...v4.0.5) (2021-04-19)


### Bug Fixes

* **google:** avoid dots in package name for secrets ([c740224](https://github.com/adobe/helix-deploy/commit/c7402243ab8745e6c41492fb9782fbc715dc9616)), closes [#222](https://github.com/adobe/helix-deploy/issues/222)

## [4.0.4](https://github.com/adobe/helix-deploy/compare/v4.0.3...v4.0.4) (2021-04-19)


### Bug Fixes

* **deploy:** try to reset all fetch context to avoid hanging processes ([#219](https://github.com/adobe/helix-deploy/issues/219)) ([afae86f](https://github.com/adobe/helix-deploy/commit/afae86ff0b278e5ba956224e0bf3a2188e3c5b24))

## [4.0.3](https://github.com/adobe/helix-deploy/compare/v4.0.2...v4.0.3) (2021-04-17)


### Bug Fixes

* **deps:** update external fixes ([0976e90](https://github.com/adobe/helix-deploy/commit/0976e909869a751b5c6a81b0aa89c5dfb5b99adc))

## [4.0.2](https://github.com/adobe/helix-deploy/compare/v4.0.1...v4.0.2) (2021-04-16)


### Bug Fixes

* **google:** allow underscore-escaped version names ([5a25bab](https://github.com/adobe/helix-deploy/commit/5a25bab610ac149fed5b4b4d473acf65d8132d5f))

## [4.0.1](https://github.com/adobe/helix-deploy/compare/v4.0.0...v4.0.1) (2021-04-12)


### Bug Fixes

* **deps:** update dependency @adobe/fastly-native-promises to v1.23.0 ([196a4d6](https://github.com/adobe/helix-deploy/commit/196a4d65ab6be73df037f78dda194a1409d68844))

# [4.0.0](https://github.com/adobe/helix-deploy/compare/v3.18.6...v4.0.0) (2021-04-12)


### Features

* **adapter:** use helix-universal ([2e7d6bf](https://github.com/adobe/helix-deploy/commit/2e7d6bf951d5312736bb3f4c3e8c5486b7e4779e)), closes [#2](https://github.com/adobe/helix-deploy/issues/2)


### BREAKING CHANGES

* **adapter:** @adobe/helix-universal is now a peer-dependency.

## [3.18.6](https://github.com/adobe/helix-deploy/compare/v3.18.5...v3.18.6) (2021-04-12)


### Bug Fixes

* **deps:** update epsagon ([#208](https://github.com/adobe/helix-deploy/issues/208)) ([575720e](https://github.com/adobe/helix-deploy/commit/575720efa62b27179b60476e1feae01c8d307ac3))

## [3.18.5](https://github.com/adobe/helix-deploy/compare/v3.18.4...v3.18.5) (2021-04-10)


### Bug Fixes

* **deps:** update external fixes ([dd9f70f](https://github.com/adobe/helix-deploy/commit/dd9f70f227a31966e634a76568d024a3f3028bdc))

## [3.18.4](https://github.com/adobe/helix-deploy/compare/v3.18.3...v3.18.4) (2021-04-09)


### Bug Fixes

* **deps:** update dependency @adobe/helix-epsagon to v1.6.3 ([#205](https://github.com/adobe/helix-deploy/issues/205)) ([bd7124d](https://github.com/adobe/helix-deploy/commit/bd7124daa1a09163ac9b7544b0e638c7ffab4c2c))

## [3.18.3](https://github.com/adobe/helix-deploy/compare/v3.18.2...v3.18.3) (2021-04-08)


### Bug Fixes

* **ow:** correctly decompose the function name ([#204](https://github.com/adobe/helix-deploy/issues/204)) ([c2448dd](https://github.com/adobe/helix-deploy/commit/c2448ddcef511ad39d0b1bc221dbc05e14a5b029))

## [3.18.2](https://github.com/adobe/helix-deploy/compare/v3.18.1...v3.18.2) (2021-04-08)


### Bug Fixes

* **deps:** update dependency @adobe/helix-epsagon to v1.6.2 ([#203](https://github.com/adobe/helix-deploy/issues/203)) ([076f5cc](https://github.com/adobe/helix-deploy/commit/076f5ccc4a9d9f978d892ad1f340eb1d710d71bf))

## [3.18.1](https://github.com/adobe/helix-deploy/compare/v3.18.0...v3.18.1) (2021-04-07)


### Bug Fixes

* **template:** clean up x-error header value prior to sending response ([2e03414](https://github.com/adobe/helix-deploy/commit/2e03414d0c0a2dec62ade96e3ca7a26fcbeae5ac)), closes [#201](https://github.com/adobe/helix-deploy/issues/201)

# [3.18.0](https://github.com/adobe/helix-deploy/compare/v3.17.0...v3.18.0) (2021-04-07)


### Features

* **adapter:** add consistent tracing information ([#200](https://github.com/adobe/helix-deploy/issues/200)) ([dab14be](https://github.com/adobe/helix-deploy/commit/dab14be0875bf5f5b082b04f92cac76e552e11c3)), closes [#199](https://github.com/adobe/helix-deploy/issues/199)

# [3.17.0](https://github.com/adobe/helix-deploy/compare/v3.16.8...v3.17.0) (2021-04-05)


### Features

* **adapter:** log better errors for missing headers ([#198](https://github.com/adobe/helix-deploy/issues/198)) ([1adc8a6](https://github.com/adobe/helix-deploy/commit/1adc8a64b73a100cc87de0969d898af264ac6e8e)), closes [#194](https://github.com/adobe/helix-deploy/issues/194)

## [3.16.8](https://github.com/adobe/helix-deploy/compare/v3.16.7...v3.16.8) (2021-04-03)


### Bug Fixes

* **deps:** update external fixes ([a94814e](https://github.com/adobe/helix-deploy/commit/a94814eb82250ecdb3da1b97a59afebe25648c55))

## [3.16.7](https://github.com/adobe/helix-deploy/compare/v3.16.6...v3.16.7) (2021-04-02)


### Bug Fixes

* **build:** don't check wsk namespace for non-deploy ([#191](https://github.com/adobe/helix-deploy/issues/191)) ([5e72dc8](https://github.com/adobe/helix-deploy/commit/5e72dc8895a240c723e29d6d39436a76e39d852d)), closes [#160](https://github.com/adobe/helix-deploy/issues/160)

## [3.16.6](https://github.com/adobe/helix-deploy/compare/v3.16.5...v3.16.6) (2021-04-01)


### Bug Fixes

* **fastly:** discard fastly client after updating links ([5b1a5e2](https://github.com/adobe/helix-deploy/commit/5b1a5e2c082e0a9e65332582619fb0bbe4037b06))

## [3.16.5](https://github.com/adobe/helix-deploy/compare/v3.16.4...v3.16.5) (2021-03-31)


### Bug Fixes

* **google:** add missing pathInfo.suffix ([49fb087](https://github.com/adobe/helix-deploy/commit/49fb08765b7356fabcaa6c4deeaa4cdb2742687c))
* **google:** use correct base to calculate pathinfo.suffix ([7c76d34](https://github.com/adobe/helix-deploy/commit/7c76d340aa7abab1610deb07a206acea1978ea2a))

## [3.16.4](https://github.com/adobe/helix-deploy/compare/v3.16.3...v3.16.4) (2021-03-31)


### Bug Fixes

* **adapter:** harmonize context and set process.env ([9e9354b](https://github.com/adobe/helix-deploy/commit/9e9354b6ad6fe5e2953a49ac961a8df3f56dffbf)), closes [#118](https://github.com/adobe/helix-deploy/issues/118) [#90](https://github.com/adobe/helix-deploy/issues/90)
* **google:** add missing pathInfo.suffix ([e800040](https://github.com/adobe/helix-deploy/commit/e80004051cfbd92a7b66171b4a0b6fbca60c3254))
* **test:** cleanup adapter tests ([4dfa143](https://github.com/adobe/helix-deploy/commit/4dfa143fd5e0540d6cabd610e364d06bfb0399c4))

## [3.16.3](https://github.com/adobe/helix-deploy/compare/v3.16.2...v3.16.3) (2021-03-30)


### Bug Fixes

* **gateway:** prevent duplication of @ in version links ([83d8857](https://github.com/adobe/helix-deploy/commit/83d88571a95bb5f8737ce4b9e2cdf43c71fa9d6d)), closes [#184](https://github.com/adobe/helix-deploy/issues/184)

## [3.16.2](https://github.com/adobe/helix-deploy/compare/v3.16.1...v3.16.2) (2021-03-30)


### Bug Fixes

* **deps:** update dependency @adobe/helix-epsagon to v1.6.1 ([5cce2b0](https://github.com/adobe/helix-deploy/commit/5cce2b0f8a7118b337a6b45f76c621c366f01f10))

## [3.16.1](https://github.com/adobe/helix-deploy/compare/v3.16.0...v3.16.1) (2021-03-27)


### Bug Fixes

* **deps:** update external fixes ([0bf3f17](https://github.com/adobe/helix-deploy/commit/0bf3f17ab978b84ef3b1ca9b38743783ffd61012))

# [3.16.0](https://github.com/adobe/helix-deploy/compare/v3.15.5...v3.16.0) (2021-03-26)


### Bug Fixes

* **gateway:** pass base config into fake deployer ([ffdc1c5](https://github.com/adobe/helix-deploy/commit/ffdc1c589b404cf27eba69738033c8716b4d5f37))
* **gateway:** pass logger directly ([e85aa52](https://github.com/adobe/helix-deploy/commit/e85aa52cefc4248d0b831d5d3d1fc701062a0e26))
* **gateway:** update latest config version ([9fdeaa3](https://github.com/adobe/helix-deploy/commit/9fdeaa3a4a3ee313695f093e8a61ba5bed5c62e4))
* **google:** fix google resolver ([e8c86fa](https://github.com/adobe/helix-deploy/commit/e8c86fa55756e47ae2680f2c7ad042cd726db93d))


### Features

* **gateway:** add aliases edge dictionary ([c1547da](https://github.com/adobe/helix-deploy/commit/c1547da2a4cc23ef3a2bbfc11acf65eb9d9d9373))
* **gateway:** look up version from dictionary ([a24fd6c](https://github.com/adobe/helix-deploy/commit/a24fd6c06d7a5b752a1643eb7f900b1bd7069216)), closes [#175](https://github.com/adobe/helix-deploy/issues/175)
* **gateway:** update aliases in gateway when fastly credentials have been provided ([05ba8bc](https://github.com/adobe/helix-deploy/commit/05ba8bc55769ffa97a7a9b5a85d58c257dd7f602)), closes [#175](https://github.com/adobe/helix-deploy/issues/175)

## [3.15.5](https://github.com/adobe/helix-deploy/compare/v3.15.4...v3.15.5) (2021-03-26)


### Bug Fixes

* **deps:** update adobe fixes ([#182](https://github.com/adobe/helix-deploy/issues/182)) ([a60ee92](https://github.com/adobe/helix-deploy/commit/a60ee9288589a41e1d38c1d646b329a2f6666aa6))

## [3.15.4](https://github.com/adobe/helix-deploy/compare/v3.15.3...v3.15.4) (2021-03-26)


### Bug Fixes

* **deps:** update dependency @adobe/helix-fetch to v2.2.0 ([9fb58a1](https://github.com/adobe/helix-deploy/commit/9fb58a1d9f443d8b91c54232468fafae6e2ef321))

## [3.15.3](https://github.com/adobe/helix-deploy/compare/v3.15.2...v3.15.3) (2021-03-26)


### Bug Fixes

* **deps:** update dependency @adobe/fastly-native-promises to v1.22.3 ([db70aa2](https://github.com/adobe/helix-deploy/commit/db70aa28ff13fc3e1bd6adceee315732bf4d3b46))

## [3.15.2](https://github.com/adobe/helix-deploy/compare/v3.15.1...v3.15.2) (2021-03-25)


### Bug Fixes

* **deps:** update dependency @adobe/helix-fetch to v2.1.9 ([993f153](https://github.com/adobe/helix-deploy/commit/993f153e65612084a3a9ba50c520480f7a983b08))

## [3.15.1](https://github.com/adobe/helix-deploy/compare/v3.15.0...v3.15.1) (2021-03-23)


### Bug Fixes

* **google:** ensure package.json has semver-compliant version strings ([3b43345](https://github.com/adobe/helix-deploy/commit/3b433459174563ea934c2fc92677b7d3d1060932)), closes [/github.com/adobe/helix-status-service/pull/2#issuecomment-804811000](https://github.com//github.com/adobe/helix-status-service/pull/2/issues/issuecomment-804811000)

# [3.15.0](https://github.com/adobe/helix-deploy/compare/v3.14.3...v3.15.0) (2021-03-23)


### Bug Fixes

* **google:** check that key file is available during ready() ([8927a79](https://github.com/adobe/helix-deploy/commit/8927a79d90f303324a53bf3cd692d013aba7e5cc)), closes [#170](https://github.com/adobe/helix-deploy/issues/170)
* **google:** use correct way to validate google config ([57ccbf1](https://github.com/adobe/helix-deploy/commit/57ccbf1b085ef12584935231a52e7822c13b1dcd)), closes [#170](https://github.com/adobe/helix-deploy/issues/170)


### Features

* **google:** additional logging for errors ([70fee0e](https://github.com/adobe/helix-deploy/commit/70fee0e67e4393d9c65273962486651b0e9f0038))

## [3.14.3](https://github.com/adobe/helix-deploy/compare/v3.14.2...v3.14.3) (2021-03-22)


### Bug Fixes

* **deps:** update dependency @adobe/helix-fetch to v2.1.8 ([0049d80](https://github.com/adobe/helix-deploy/commit/0049d80c48d82da0ed3c62da5c7285d1fc26dc31))

## [3.14.2](https://github.com/adobe/helix-deploy/compare/v3.14.1...v3.14.2) (2021-03-20)


### Bug Fixes

* **deps:** update external fixes to v3.9.0 ([f708b12](https://github.com/adobe/helix-deploy/commit/f708b12d915a5c8820e480c3b7a64dd91b7a5d22))

## [3.14.1](https://github.com/adobe/helix-deploy/compare/v3.14.0...v3.14.1) (2021-03-18)


### Bug Fixes

* **google:** only enable google deployer when keyfile exists ([985c1c6](https://github.com/adobe/helix-deploy/commit/985c1c6f94c0551bd4b7233011479bb0216cc6c3))

# [3.14.0](https://github.com/adobe/helix-deploy/compare/v3.13.0...v3.14.0) (2021-03-12)


### Features

* **aws:** cache package parameters ([#163](https://github.com/adobe/helix-deploy/issues/163)) ([ff2e9e8](https://github.com/adobe/helix-deploy/commit/ff2e9e8918d6be7dbe05c50a2d52ce2961172259)), closes [#162](https://github.com/adobe/helix-deploy/issues/162)

# [3.13.0](https://github.com/adobe/helix-deploy/compare/v3.12.0...v3.13.0) (2021-03-12)


### Features

* **epsagon:** disable epsagon for status pings ([06adcd1](https://github.com/adobe/helix-deploy/commit/06adcd12a44327d8a1d2d07ec9addc3ef8a00ad7)), closes [#158](https://github.com/adobe/helix-deploy/issues/158)

# [3.12.0](https://github.com/adobe/helix-deploy/compare/v3.11.0...v3.12.0) (2021-03-11)


### Bug Fixes

* **gateway:** add missing quotes to log strings ([c448ae3](https://github.com/adobe/helix-deploy/commit/c448ae3d2efbc0da881cc7eda7115b87c46d4cd5))
* **gateway:** escape error header ([bc3a5fd](https://github.com/adobe/helix-deploy/commit/bc3a5fdb1661d58356f35824900dcc8b5664b4ef))


### Features

* **gateway:** log transaction id and activation id for google ([587d5c4](https://github.com/adobe/helix-deploy/commit/587d5c4bf85a1cb58afa21f40e775abe60192fc5))

# [3.11.0](https://github.com/adobe/helix-deploy/compare/v3.10.0...v3.11.0) (2021-03-10)


### Features

* **gateway:** log x-error header ([48fd859](https://github.com/adobe/helix-deploy/commit/48fd859ff03b2fe618df19f8018f7e5523e15f85)), closes [adobe/helix-logging#461](https://github.com/adobe/helix-logging/issues/461)
* **template:** set x-error header for caught 500s ([a94d200](https://github.com/adobe/helix-deploy/commit/a94d20065498b6f74bfc114acbed0b312e94440d)), closes [adobe/helix-logging#461](https://github.com/adobe/helix-logging/issues/461)

# [3.10.0](https://github.com/adobe/helix-deploy/compare/v3.9.1...v3.10.0) (2021-03-10)


### Bug Fixes

* **gateway:** log status code as integer instead of string ([3e21280](https://github.com/adobe/helix-deploy/commit/3e2128065149ed8a9f450b40aff3bcf53ef1e10c))


### Features

* **gateway:** log the version lock header value ([68d8258](https://github.com/adobe/helix-deploy/commit/68d82583c6462ea3446acb586bd94dca77aa9027))
* **gateway:** trace aws and openwhisk transaction ids ([7419418](https://github.com/adobe/helix-deploy/commit/7419418eb6106154dc62a7ab9bb468a9f3ba07b3))

## [3.9.1](https://github.com/adobe/helix-deploy/compare/v3.9.0...v3.9.1) (2021-03-09)


### Bug Fixes

* **adapter:** handle illegal request header errors with 400 ([#155](https://github.com/adobe/helix-deploy/issues/155)) ([e654b81](https://github.com/adobe/helix-deploy/commit/e654b81a3d7ad39dd09c2a8e902c54a236cbe4c7)), closes [#154](https://github.com/adobe/helix-deploy/issues/154)

# [3.9.0](https://github.com/adobe/helix-deploy/compare/v3.8.0...v3.9.0) (2021-03-08)


### Bug Fixes

* **gateway:** only attempt to restart the request for idepotempt HTTP methods ([c1584f6](https://github.com/adobe/helix-deploy/commit/c1584f6c53eb982330c077d38d9d6e4239218c7b)), closes [#152](https://github.com/adobe/helix-deploy/issues/152)
* **vcl:** fix vcl syntax ([76352bd](https://github.com/adobe/helix-deploy/commit/76352bddb7394950058b33fb1931ac8018c4ba32))


### Features

* **gateway:** re-try when backend responds with 503 or 504 ([1144684](https://github.com/adobe/helix-deploy/commit/114468407cc8e24d78cfb7bd5304119e3ae865b0)), closes [#152](https://github.com/adobe/helix-deploy/issues/152)

# [3.8.0](https://github.com/adobe/helix-deploy/compare/v3.7.1...v3.8.0) (2021-03-08)


### Features

* **uni:** add espagon support for AWS ([#149](https://github.com/adobe/helix-deploy/issues/149)) ([6be2f8b](https://github.com/adobe/helix-deploy/commit/6be2f8b60beb49033c5351d179e4cbbd78a20a5c)), closes [#147](https://github.com/adobe/helix-deploy/issues/147)

## [3.7.1](https://github.com/adobe/helix-deploy/compare/v3.7.0...v3.7.1) (2021-03-06)


### Bug Fixes

* **deps:** update external fixes ([8232445](https://github.com/adobe/helix-deploy/commit/8232445045941759041e327b3f2159e94da1add4))

# [3.7.0](https://github.com/adobe/helix-deploy/compare/v3.6.6...v3.7.0) (2021-03-05)


### Features

* **aws:** delete unused integrations ([#143](https://github.com/adobe/helix-deploy/issues/143)) ([c72e443](https://github.com/adobe/helix-deploy/commit/c72e4438c47c009c3a12ca72b15712d7e3993936)), closes [#128](https://github.com/adobe/helix-deploy/issues/128)

## [3.6.6](https://github.com/adobe/helix-deploy/compare/v3.6.5...v3.6.6) (2021-03-04)


### Bug Fixes

* **deps:** update dependency @adobe/fastly-native-promises to v1.22.2 ([0062431](https://github.com/adobe/helix-deploy/commit/0062431d20cdd857eafb5a6d746a2a49b08309a2))

## [3.6.5](https://github.com/adobe/helix-deploy/compare/v3.6.4...v3.6.5) (2021-03-04)


### Bug Fixes

* **deps:** update dependency @adobe/helix-fetch to v2.1.7 ([a99cb68](https://github.com/adobe/helix-deploy/commit/a99cb6810d8cf66226c513a1a39f2687edc0aa6d))

## [3.6.4](https://github.com/adobe/helix-deploy/compare/v3.6.3...v3.6.4) (2021-03-04)


### Bug Fixes

* **openwhisk:** assume utf-8 encoded json ([2ae702c](https://github.com/adobe/helix-deploy/commit/2ae702c955aaec690de756d053cc3625bce7d47b))
* **openwhisk:** convert base64 encoded json request bodies into strings ([1bb4183](https://github.com/adobe/helix-deploy/commit/1bb41839bd92dc178ef7ebbcbceca83f3dc04c5c)), closes [#141](https://github.com/adobe/helix-deploy/issues/141)

## [3.6.3](https://github.com/adobe/helix-deploy/compare/v3.6.2...v3.6.3) (2021-03-03)


### Bug Fixes

* **logging:** cleanup action name in logs ([437af02](https://github.com/adobe/helix-deploy/commit/437af0294be8fb9465cf749919e8cad498c69d31))

## [3.6.2](https://github.com/adobe/helix-deploy/compare/v3.6.1...v3.6.2) (2021-03-03)


### Bug Fixes

* **deps:** update dependency @adobe/fastly-native-promises to v1.22.1 ([#139](https://github.com/adobe/helix-deploy/issues/139)) ([56133ee](https://github.com/adobe/helix-deploy/commit/56133ee93f40fc10615d22d75bd09bad27db7af0))

## [3.6.1](https://github.com/adobe/helix-deploy/compare/v3.6.0...v3.6.1) (2021-03-03)


### Bug Fixes

* **aws:** ensure version in context.func is correct ([#138](https://github.com/adobe/helix-deploy/issues/138)) ([97b9a39](https://github.com/adobe/helix-deploy/commit/97b9a3969c32ddf7f2b75b0ab5bf64572d87a753)), closes [#129](https://github.com/adobe/helix-deploy/issues/129)

# [3.6.0](https://github.com/adobe/helix-deploy/compare/v3.5.0...v3.6.0) (2021-03-02)


### Bug Fixes

* **azure:** use correct base path ([793ae68](https://github.com/adobe/helix-deploy/commit/793ae680327989c623f473d066b493fb90ed422e)), closes [#131](https://github.com/adobe/helix-deploy/issues/131)
* **google:** add slash to health check URL ([ecddf7d](https://github.com/adobe/helix-deploy/commit/ecddf7d74040b538ce7a774f61d4ea4717b02fcf)), closes [#130](https://github.com/adobe/helix-deploy/issues/130)
* **google:** use correct base path for health check ([bf237f6](https://github.com/adobe/helix-deploy/commit/bf237f6b39c900b21442bbb8e5f2eb9baa34da9c)), closes [#130](https://github.com/adobe/helix-deploy/issues/130)
* **google:** use underscore instead of . in version URLs ([c236838](https://github.com/adobe/helix-deploy/commit/c236838fd1915dcde41d529cbc7c03d91ffed604)), closes [#130](https://github.com/adobe/helix-deploy/issues/130)
* **google:** use underscores in _version ([8eb3453](https://github.com/adobe/helix-deploy/commit/8eb3453cf669ed714289502177bc5ef8ed0a502f)), closes [#130](https://github.com/adobe/helix-deploy/issues/130)


### Features

* **azure:** add host getter ([39b6111](https://github.com/adobe/helix-deploy/commit/39b611138e67c2ee43484540f7223b3fd4a06418)), closes [#131](https://github.com/adobe/helix-deploy/issues/131)
* **azure:** set backend url in vcl ([2bf7c01](https://github.com/adobe/helix-deploy/commit/2bf7c01004ad1aa4d5f3defdab9cfccdc0b5236d)), closes [#131](https://github.com/adobe/helix-deploy/issues/131)
* **google:** add host getter ([9c253a2](https://github.com/adobe/helix-deploy/commit/9c253a2b6a2b664cac28693bec8730a6e189151f)), closes [#130](https://github.com/adobe/helix-deploy/issues/130)
* **google:** calculate backend url in vcl ([eff3130](https://github.com/adobe/helix-deploy/commit/eff313048dd651fb0c5eef6e68dadc64e0cd0f22)), closes [#130](https://github.com/adobe/helix-deploy/issues/130)

# [3.5.0](https://github.com/adobe/helix-deploy/compare/v3.4.5...v3.5.0) (2021-03-02)


### Bug Fixes

* **cli:** add new args to gateway group ([129d691](https://github.com/adobe/helix-deploy/commit/129d691edeac3bacc67d8cfedf5c3d8211576192))
* **fastly:** discard the fastly client after all operations have finished ([0416904](https://github.com/adobe/helix-deploy/commit/04169042a29ff618479a8fce864c44dc59fab243))
* **fastly:** use correct escape code for regexes ([325a08b](https://github.com/adobe/helix-deploy/commit/325a08bdeda282cf7f8d23447c4f0009d57a5d42))
* **gateway:** double escape backslashes ([6c02054](https://github.com/adobe/helix-deploy/commit/6c02054895b4eeb6e477cff8b1cf7f3ef2959bfa))
* **gateway:** use json string for application name ([3e5f37e](https://github.com/adobe/helix-deploy/commit/3e5f37e3efeb37e43fb10818238d2270ca725613))


### Features

* **gateway:** enable gateway logging to coralogix ([0b32b15](https://github.com/adobe/helix-deploy/commit/0b32b15c0d63b9a28cd287ded9e208f50123c794)), closes [#126](https://github.com/adobe/helix-deploy/issues/126)

## [3.4.5](https://github.com/adobe/helix-deploy/compare/v3.4.4...v3.4.5) (2021-03-01)


### Bug Fixes

* **deps:** update dependency @adobe/fastly-native-promises to v1.22.0 ([f4214ee](https://github.com/adobe/helix-deploy/commit/f4214eef8dd22f709891b5d4cb89e0d100d7c663))

## [3.4.4](https://github.com/adobe/helix-deploy/compare/v3.4.3...v3.4.4) (2021-03-01)


### Bug Fixes

* **deps:** update dependency @adobe/fastly-native-promises to v1.21.0 ([f061f70](https://github.com/adobe/helix-deploy/commit/f061f70370070d1e1e8207696617b43a73fe9bf7))

## [3.4.3](https://github.com/adobe/helix-deploy/compare/v3.4.2...v3.4.3) (2021-02-27)


### Bug Fixes

* **deps:** update external fixes ([a6261cf](https://github.com/adobe/helix-deploy/commit/a6261cfbb7a0a85092bb96443998e6c1872f0408))

## [3.4.2](https://github.com/adobe/helix-deploy/compare/v3.4.1...v3.4.2) (2021-02-26)


### Bug Fixes

* **deps:** update adobe fixes ([d196562](https://github.com/adobe/helix-deploy/commit/d196562011a4318f1277d6ee26a7497d2ae06db6))

## [3.4.1](https://github.com/adobe/helix-deploy/compare/v[secure]...v3.4.1) (2021-02-25)


### Bug Fixes

* **google:** do not enable google deployer if project id has not been specified ([#125](https://github.com/adobe/helix-deploy/issues/125)) ([c95b5ad](https://github.com/adobe/helix-deploy/commit/c95b5ad8968d7482ef403a196d9ce360451ae3b3)), closes [#123](https://github.com/adobe/helix-deploy/issues/123)

# [[secure]](https://github.com/adobe/helix-deploy/compare/v3.3.0...v[secure]) (2021-02-24)


### Bug Fixes

* **azure:** allow paths in azure function URLs ([19c8f02](https://github.com/adobe/helix-deploy/commit/19c8f028568cf6d2ae0724f68aa70cf0d05b55ce))
* **azure:** make azure integration test pass again ([6f6d903](https://github.com/adobe/helix-deploy/commit/6f6d903ecdb2a60258d5796c4c21222277753616)), closes [#31](https://github.com/adobe/helix-deploy/issues/31)
* **azure:** update package parameters using application settings api ([e9129ea](https://github.com/adobe/helix-deploy/commit/e9129ea84799edc9e904e023901480c87aae597e)), closes [#31](https://github.com/adobe/helix-deploy/issues/31)


### Features

* **azure:** get path info/suffix and version from url ([e53784e](https://github.com/adobe/helix-deploy/commit/e53784ef52e1783e6a28b4d1b1d9a86ad789cd1c))

# [3.3.0](https://github.com/adobe/helix-deploy/compare/v3.2.0...v3.3.0) (2021-02-24)


### Features

* **log:** flush log in AWS if present ([#120](https://github.com/adobe/helix-deploy/issues/120)) ([d7c5fbd](https://github.com/adobe/helix-deploy/commit/d7c5fbde9f55c92bd7227aa779f578408bc9de05))

# [3.2.0](https://github.com/adobe/helix-deploy/compare/v3.1.2...v3.2.0) (2021-02-22)


### Bug Fixes

* **google:** catch runtime error (secret retrieval) ([f08ef6a](https://github.com/adobe/helix-deploy/commit/f08ef6aa200ef4d37f75655c2aafa49e4a7d9657))
* **google:** exclude google secrets manager dependency from bundle ([f21cab8](https://github.com/adobe/helix-deploy/commit/f21cab8091f36647a991fbe43a6fe5a0b38ccb35))
* **google:** install google secrets manager client through package.json ([1e73576](https://github.com/adobe/helix-deploy/commit/1e7357629f3602dc8debfd8b8fcc49d02438d191))
* **google:** remove double dots ([05184c3](https://github.com/adobe/helix-deploy/commit/05184c3ae88cdb24d9fa98a2eadb54c9cf74f535))
* **google:** use cwd as a function ([ef9405d](https://github.com/adobe/helix-deploy/commit/ef9405db95cb9128e7d6df265114e6b74038e08c))


### Features

* **cli:** add google plugin ([74e2bee](https://github.com/adobe/helix-deploy/commit/74e2bee0e8771bfe497b755cfddb580534e735a3))
* **google:** add ability to select google region ([8800cd0](https://github.com/adobe/helix-deploy/commit/8800cd028774e511791a3bb40428b732eaa2ca86))
* **google:** add labels, description, memory, runtime version to function ([1718531](https://github.com/adobe/helix-deploy/commit/1718531476e873473f6e99d7f692a05251c0b351))
* **google:** allow updates and anonymous http requests ([b9e7150](https://github.com/adobe/helix-deploy/commit/b9e7150d3b5b4935f4e5e668dc65f3876989b01b))
* **google:** deploy a function ([e50f546](https://github.com/adobe/helix-deploy/commit/e50f546c1793b27303ed298a30e9b34c64dac5e3))
* **google:** enable self-test after deploy ([a01aaed](https://github.com/adobe/helix-deploy/commit/a01aaed35ac7fe8ce541faa7d35a9b58e803fa10))
* **google:** initial draft of google functions deployment tool ([fef680b](https://github.com/adobe/helix-deploy/commit/fef680bcf29649154ecacf87b4b234b27eb0c91b))
* **google:** retrieve package secrets at runtime ([18ef9a2](https://github.com/adobe/helix-deploy/commit/18ef9a2eb61eaecdfa79e237da242361dfc26fcf))
* **google:** set environment variables ([8cd1760](https://github.com/adobe/helix-deploy/commit/8cd1760a256e02dd48d8e189a4a65d877c7746e3))
* **google:** store secrets in google secrets manager ([966a861](https://github.com/adobe/helix-deploy/commit/966a861acc51881f1968ac6b29b28235b444d7ec))


### Reverts

* Revert "ci: use codecov bash uploader" ([2e348ac](https://github.com/adobe/helix-deploy/commit/2e348acb920c5b352ba1ca4dc8fb9d231b6c5801))

## [3.1.2](https://github.com/adobe/helix-deploy/compare/v3.1.1...v3.1.2) (2021-02-22)


### Bug Fixes

* **deps:** update external to v3.6.0 ([#117](https://github.com/adobe/helix-deploy/issues/117)) ([af08624](https://github.com/adobe/helix-deploy/commit/af086242e822b9392f3f677f9ef61060ae3ee726))

## [3.1.1](https://github.com/adobe/helix-deploy/compare/v3.1.0...v3.1.1) (2021-02-18)


### Bug Fixes

* **deps:** update dependency @adobe/fastly-native-promises to v1.19.13 ([3da8a57](https://github.com/adobe/helix-deploy/commit/3da8a5786e7fd131e6e80e93bc984ddfc6a8158d))

# [3.1.0](https://github.com/adobe/helix-deploy/compare/v3.0.18...v3.1.0) (2021-02-18)


### Bug Fixes

* **gateway:** do not lowercase backend names ([b3ee254](https://github.com/adobe/helix-deploy/commit/b3ee254261ce8dd6aeb57b101bcc87b0ea62d830))
* **gateway:** provide string default value for string dictionaries ([1f77bd5](https://github.com/adobe/helix-deploy/commit/1f77bd5ffbf3078a035254b6e5acc2981db522e4))
* **gateway:** upper limit is not index-dependent ([7e6c1d2](https://github.com/adobe/helix-deploy/commit/7e6c1d28f7bf08fa6875854f511f895a160dee8c))


### Features

* **gateway:** create dictionary with runtime priorities ([fc2abb3](https://github.com/adobe/helix-deploy/commit/fc2abb335a1b9d1dbff1f5e131b21ecb8674c6de)), closes [#112](https://github.com/adobe/helix-deploy/issues/112)
* **gateway:** read priorities from edge dictionary ([83dea75](https://github.com/adobe/helix-deploy/commit/83dea758dcf7fbb8317bda27a7111fad536f341c))

## [3.0.18](https://github.com/adobe/helix-deploy/compare/v3.0.17...v3.0.18) (2021-02-16)


### Bug Fixes

* **deps:** update dependency @adobe/helix-fetch to v2.1.5 ([ae3b199](https://github.com/adobe/helix-deploy/commit/ae3b19942cae4afc6c6a7375da222dff70b2cc5d))

## [3.0.17](https://github.com/adobe/helix-deploy/compare/v3.0.16...v3.0.17) (2021-02-15)


### Bug Fixes

* **deps:** bump deps ([45a1f6c](https://github.com/adobe/helix-deploy/commit/45a1f6c011bca8644b4a8ac285cd396ac4169a04))

## [3.0.16](https://github.com/adobe/helix-deploy/compare/v3.0.15...v3.0.16) (2021-02-15)


### Bug Fixes

* **deps:** update external ([#110](https://github.com/adobe/helix-deploy/issues/110)) ([99da463](https://github.com/adobe/helix-deploy/commit/99da4631d988e74089ebabf383374fe11a49617c))

## [3.0.15](https://github.com/adobe/helix-deploy/compare/v3.0.14...v3.0.15) (2021-02-12)


### Bug Fixes

* **deps:** update dependency @adobe/helix-fetch to v2.1.4 ([26fbcb0](https://github.com/adobe/helix-deploy/commit/26fbcb0638473cbb179777745b8b26667417eb3b))

## [3.0.14](https://github.com/adobe/helix-deploy/compare/v3.0.13...v3.0.14) (2021-02-10)


### Bug Fixes

* **gateway:** fix snippet name ([ae3c043](https://github.com/adobe/helix-deploy/commit/ae3c04391fd0b201ae87375337b0a7a7a511f7c1))
* **gateway:** stash and restore surrogate headers in fetch and deliver ([b153f16](https://github.com/adobe/helix-deploy/commit/b153f16537df3e3bd0b82b777cd831a0214c39ea)), closes [#105](https://github.com/adobe/helix-deploy/issues/105)
* **gateway:** use surrogate key from response ([c48b8d4](https://github.com/adobe/helix-deploy/commit/c48b8d4e4c5442cb9d7f3686a50fd5a6c75b0605))

## [3.0.13](https://github.com/adobe/helix-deploy/compare/v3.0.12...v3.0.13) (2021-02-09)


### Bug Fixes

* **deps:** update dependency @adobe/helix-fetch to v2.1.3 ([ab96be4](https://github.com/adobe/helix-deploy/commit/ab96be49914b62173af89af8e009b23e81b1fb28))

## [3.0.12](https://github.com/adobe/helix-deploy/compare/v3.0.11...v3.0.12) (2021-02-09)


### Bug Fixes

* **deps:** update to helix-epsagon 1.5.8 ([#100](https://github.com/adobe/helix-deploy/issues/100)) ([ca8e07e](https://github.com/adobe/helix-deploy/commit/ca8e07e40e02f515f24c20fc6c28be411cfcbb16))

## [3.0.11](https://github.com/adobe/helix-deploy/compare/v3.0.10...v3.0.11) (2021-02-05)


### Bug Fixes

* use correct cache option ([#98](https://github.com/adobe/helix-deploy/issues/98)) ([08eee16](https://github.com/adobe/helix-deploy/commit/08eee161eaef40e4fd3e170469c7f0581db4da28))

## [3.0.10](https://github.com/adobe/helix-deploy/compare/v3.0.9...v3.0.10) (2021-02-04)


### Bug Fixes

* **deps:** update [@adobe](https://github.com/adobe) ([75a4c77](https://github.com/adobe/helix-deploy/commit/75a4c77ecd306157d55a48c918bb857894bcfe51))

## [3.0.9](https://github.com/adobe/helix-deploy/compare/v3.0.8...v3.0.9) (2021-02-04)


### Bug Fixes

* **deps:** update dependency @adobe/helix-fetch to v2.1.1 ([66b2fcf](https://github.com/adobe/helix-deploy/commit/66b2fcf73cbc2c317aae8a15f97f5011246a29d9))

## [3.0.8](https://github.com/adobe/helix-deploy/compare/v3.0.7...v3.0.8) (2021-02-01)


### Bug Fixes

* **aws:** ensure permissions are setup even if not creating routes ([#95](https://github.com/adobe/helix-deploy/issues/95)) ([a9e9e13](https://github.com/adobe/helix-deploy/commit/a9e9e134491ee2db6b50cd91392b304f85423459))

## [3.0.7](https://github.com/adobe/helix-deploy/compare/v3.0.6...v3.0.7) (2021-02-01)


### Bug Fixes

* **deps:** update dependency @adobe/helix-epsagon to v1.5.7 ([4ca0ca2](https://github.com/adobe/helix-deploy/commit/4ca0ca25b76dea837422692c9240abd953df2ae2))

## [3.0.6](https://github.com/adobe/helix-deploy/compare/v3.0.5...v3.0.6) (2021-02-01)


### Bug Fixes

* **deps:** update external ([#93](https://github.com/adobe/helix-deploy/issues/93)) ([eb217d0](https://github.com/adobe/helix-deploy/commit/eb217d0e3ed98f46721638dc2370a5e383bd3270))

## [3.0.5](https://github.com/adobe/helix-deploy/compare/v3.0.4...v3.0.5) (2021-01-29)


### Bug Fixes

* **deps:** update dependency @adobe/helix-fetch to v2.1.0 ([fe0c166](https://github.com/adobe/helix-deploy/commit/fe0c1669e41dfc80a31191d7d44336856c46da1e))

## [3.0.4](https://github.com/adobe/helix-deploy/compare/v3.0.3...v3.0.4) (2021-01-28)


### Bug Fixes

* **gateway:** reduce check frequency by factor 10 ([a3e0257](https://github.com/adobe/helix-deploy/commit/a3e0257535383760f027c3074ba7680a10c5cb0e))

## [3.0.3](https://github.com/adobe/helix-deploy/compare/v3.0.2...v3.0.3) (2021-01-26)


### Bug Fixes

* **deps:** update dependency @adobe/fastly-native-promises to v1.19.7 ([e00e5ae](https://github.com/adobe/helix-deploy/commit/e00e5ae5cf40c10356b1803444641e1674cebbf2))

## [3.0.2](https://github.com/adobe/helix-deploy/compare/v3.0.1...v3.0.2) (2021-01-26)


### Bug Fixes

* **deps:** update dependency @adobe/helix-fetch to v2.0.1 ([d60a7ae](https://github.com/adobe/helix-deploy/commit/d60a7aeeb3c9e1a5939b6d66b57eeaeba85ad542))

## [3.0.1](https://github.com/adobe/helix-deploy/compare/v3.0.0...v3.0.1) (2021-01-26)


### Bug Fixes

* **deps:** update dependency @adobe/fastly-native-promises to v1.19.6 ([3a20236](https://github.com/adobe/helix-deploy/commit/3a2023601466e122b8a48e62e1c0f0255c287628))

# [3.0.0](https://github.com/adobe/helix-deploy/compare/v2.0.0...v3.0.0) (2021-01-26)


### Bug Fixes

* **deps:** update dependency @adobe/helix-fetch to v2 ([#82](https://github.com/adobe/helix-deploy/issues/82)) ([4c91c73](https://github.com/adobe/helix-deploy/commit/4c91c732c2932e424a9b64f9fde5d8bcd1fd564b))
* **test:** fix failing test ([7f13b39](https://github.com/adobe/helix-deploy/commit/7f13b3959b14ae210002b1225750f9a4c1e15be0))


### Features

* **aws:** add possibility to define lambda name format ([#84](https://github.com/adobe/helix-deploy/issues/84)) ([4404874](https://github.com/adobe/helix-deploy/commit/440487425ddc6a453bca04e7a8c417c89e8e5402)), closes [#78](https://github.com/adobe/helix-deploy/issues/78)


### BREAKING CHANGES

* **deps:** minimum node version is now 12

# [2.0.0](https://github.com/adobe/helix-deploy/compare/v1.18.2...v2.0.0) (2021-01-26)


### Bug Fixes

* **gateway:** extract package name from URL instead of config ([07235ed](https://github.com/adobe/helix-deploy/commit/07235edcbc4d3c2f9152bc8e9fe833e4a9010974))
* **gateway:** url rewriting for pass should happen in `vcl_pass` ([0315ec7](https://github.com/adobe/helix-deploy/commit/0315ec77fd29fae3362c5d90d5321b5a9b8dca8f))


### Features

* **gateway:** extract common variables from path ([fc32873](https://github.com/adobe/helix-deploy/commit/fc328738377b0a349cc9a93d6b8e739f8e42bb9d)), closes [#80](https://github.com/adobe/helix-deploy/issues/80)


### BREAKING CHANGES

* **gateway:** fixes #80 and breaks all Gateway URLs

## [1.18.2](https://github.com/adobe/helix-deploy/compare/v1.18.1...v1.18.2) (2021-01-21)


### Bug Fixes

* **aws:** disable route/integration generation by default ([a0887f6](https://github.com/adobe/helix-deploy/commit/a0887f6258dabd59dde0e7ed1ba5e871f1ea7354)), closes [#45](https://github.com/adobe/helix-deploy/issues/45)
* **wsk:** ensure only recognized content type are considered non-binary ([e66bc6e](https://github.com/adobe/helix-deploy/commit/e66bc6e2e236d724748d69160659104fbbf5cc98)), closes [#74](https://github.com/adobe/helix-deploy/issues/74)

## [1.18.1](https://github.com/adobe/helix-deploy/compare/v1.18.0...v1.18.1) (2021-01-21)


### Bug Fixes

* **deps:** update dependency @adobe/helix-epsagon to v1.5.6 ([8354d80](https://github.com/adobe/helix-deploy/commit/8354d80ab6da3fb1166df175f5f4c83fb59789f2))

# [1.18.0](https://github.com/adobe/helix-deploy/compare/v1.17.3...v1.18.0) (2021-01-19)


### Bug Fixes

* **aws:** fix base path ([9d1233a](https://github.com/adobe/helix-deploy/commit/9d1233a6f91cc0ddbe78fa7b475e2abc9e5e7bf1))
* **aws:** use function path for base path ([39e84c3](https://github.com/adobe/helix-deploy/commit/39e84c3f44c2b4703f329302304ac5cbb33def1b))
* **deps:** bump fastly client version ([7c4141a](https://github.com/adobe/helix-deploy/commit/7c4141a37c331bc6cb5089c82b21ddc277d6c66f))
* **gateway:** do not allow random selection if version lock specifies environment ([29240c1](https://github.com/adobe/helix-deploy/commit/29240c11ed0e616cd5d5f3e06c9b6c9fc0c75dff))


### Features

* **gateway:** allow specifying a cloud environment using the version-lock header ([7fa1c69](https://github.com/adobe/helix-deploy/commit/7fa1c69f55faffcbe9812d0b9cdd5e8285d8a0cf))

## [1.17.3](https://github.com/adobe/helix-deploy/compare/v1.17.2...v1.17.3) (2021-01-11)


### Bug Fixes

* **deps:** update external ([#69](https://github.com/adobe/helix-deploy/issues/69)) ([af94ee5](https://github.com/adobe/helix-deploy/commit/af94ee54b78fbc6070a1063d249b39c836bf6bd8))

## [1.17.2](https://github.com/adobe/helix-deploy/compare/v1.17.1...v1.17.2) (2021-01-06)


### Bug Fixes

* **deps:** update dependency @adobe/fastly-native-promises to v1.19.4 ([89bb646](https://github.com/adobe/helix-deploy/commit/89bb646872a9a371555b5d06cf6d216952ed5658))

## [1.17.1](https://github.com/adobe/helix-deploy/compare/v1.17.0...v1.17.1) (2021-01-06)


### Bug Fixes

* **deps:** update dependency @adobe/fastly-native-promises to v1.19.3 ([be5d38c](https://github.com/adobe/helix-deploy/commit/be5d38c6f9b38fbb51195b77b60f2403b7e9f9d8))

# [1.17.0](https://github.com/adobe/helix-deploy/compare/v1.16.0...v1.17.0) (2021-01-06)


### Features

* **builder:** add support for formats and properties  ([19a7355](https://github.com/adobe/helix-deploy/commit/19a7355d22cfd277a58879577f520f5146f91378)), closes [#58](https://github.com/adobe/helix-deploy/issues/58) [#64](https://github.com/adobe/helix-deploy/issues/64)

# [1.16.0](https://github.com/adobe/helix-deploy/compare/v1.15.4...v1.16.0) (2021-01-05)


### Features

* **adapter:** add charset=utf-8 if missing ([#60](https://github.com/adobe/helix-deploy/issues/60)) ([60f71f7](https://github.com/adobe/helix-deploy/commit/60f71f72ce7c57d9ca2ea45c3da4787dea1ac278)), closes [#59](https://github.com/adobe/helix-deploy/issues/59)

## [1.15.4](https://github.com/adobe/helix-deploy/compare/v1.15.3...v1.15.4) (2021-01-05)


### Bug Fixes

* **deps:** update dependency @adobe/fastly-native-promises to v1.19.2 ([#57](https://github.com/adobe/helix-deploy/issues/57)) ([504c199](https://github.com/adobe/helix-deploy/commit/504c199d98df2788313bcf6be505850d0b6e9c7e))

## [1.15.3](https://github.com/adobe/helix-deploy/compare/v1.15.2...v1.15.3) (2021-01-05)


### Bug Fixes

* execute all steps and abort later ([f427f42](https://github.com/adobe/helix-deploy/commit/f427f42238e795f0ac92c132ac8d05af33ac2014)), closes [#55](https://github.com/adobe/helix-deploy/issues/55)
* record dependencies for deploy w/o build ([6c8dd15](https://github.com/adobe/helix-deploy/commit/6c8dd156e4c6b73b8096b67d6f92ca525e11049e)), closes [#54](https://github.com/adobe/helix-deploy/issues/54)

## [1.15.2](https://github.com/adobe/helix-deploy/compare/v1.15.1...v1.15.2) (2021-01-02)


### Bug Fixes

* **adapter:** resolver should work with no version (for html actions) ([#51](https://github.com/adobe/helix-deploy/issues/51)) ([a843508](https://github.com/adobe/helix-deploy/commit/a84350893b1da0126c5a30a3bdb72779f15b95e5))

## [1.15.1](https://github.com/adobe/helix-deploy/compare/v1.15.0...v1.15.1) (2021-01-01)


### Bug Fixes

* **wsk:** invoke via API doesn't propagate params ([97d884a](https://github.com/adobe/helix-deploy/commit/97d884a9ca072ba7d16d81501fd8fb66255e9f1a)), closes [#48](https://github.com/adobe/helix-deploy/issues/48)

# [1.15.0](https://github.com/adobe/helix-deploy/compare/v1.14.0...v1.15.0) (2020-12-28)


### Features

* **universal:** add resolver for function names ([01d6efb](https://github.com/adobe/helix-deploy/commit/01d6efbe2f2fa00c101fe467d8a4f3812f501dda))

# [1.14.0](https://github.com/adobe/helix-deploy/compare/v1.13.0...v1.14.0) (2020-12-27)


### Features

* harmonize use of actionName; introduce baseName ([2bc33d4](https://github.com/adobe/helix-deploy/commit/2bc33d4e0b17781255fc6ea9c48cc4bb3b39dd18))
* **AWS:** routes should have version as path ([7af1e6d](https://github.com/adobe/helix-deploy/commit/7af1e6dd21199311c11a77645f1f7a0a5f35c409)), closes [#44](https://github.com/adobe/helix-deploy/issues/44)

# [1.13.0](https://github.com/adobe/helix-deploy/compare/v1.12.0...v1.13.0) (2020-12-25)


### Features

* refactoring ([5f877a3](https://github.com/adobe/helix-deploy/commit/5f877a3adc0ac3b6c8763c71ea74f34501b568ce))

# [1.12.0](https://github.com/adobe/helix-deploy/compare/v1.11.0...v1.12.0) (2020-12-24)


### Features

* **aws:** adding routes for symlinks ([9ec6e92](https://github.com/adobe/helix-deploy/commit/9ec6e922085da651e3eed40d285c506545069258)), closes [#41](https://github.com/adobe/helix-deploy/issues/41)

# [1.11.0](https://github.com/adobe/helix-deploy/compare/v1.10.1...v1.11.0) (2020-12-22)


### Features

* add option to minify bundle and default node version to 12 ([#40](https://github.com/adobe/helix-deploy/issues/40)) ([298a0b0](https://github.com/adobe/helix-deploy/commit/298a0b07d33b036b7e206fe22b673029e78bccfb))

## [1.10.1](https://github.com/adobe/helix-deploy/compare/v1.10.0...v1.10.1) (2020-12-21)


### Bug Fixes

* openwhisk update links no longer works ([#39](https://github.com/adobe/helix-deploy/issues/39)) ([0f0b2b6](https://github.com/adobe/helix-deploy/commit/0f0b2b685d6fa7603b5cce65a7e0705af82f544b))

# [1.10.0](https://github.com/adobe/helix-deploy/compare/v1.9.1...v1.10.0) (2020-12-21)


### Bug Fixes

* **aws:** fetch all parameters ([#38](https://github.com/adobe/helix-deploy/issues/38)) ([a98f7d8](https://github.com/adobe/helix-deploy/commit/a98f7d8fd26e095c944226095547ca418fc114cd)), closes [#37](https://github.com/adobe/helix-deploy/issues/37) [#36](https://github.com/adobe/helix-deploy/issues/36)
* **aws:** retry test for 404 ([#35](https://github.com/adobe/helix-deploy/issues/35)) ([7607c45](https://github.com/adobe/helix-deploy/commit/7607c45bf7e95f27c60aadb67b53a8888aa5f0d8)), closes [#32](https://github.com/adobe/helix-deploy/issues/32)


### Features

* **aws:** add command to delete stray buckets ([#34](https://github.com/adobe/helix-deploy/issues/34)) ([f6b1fa1](https://github.com/adobe/helix-deploy/commit/f6b1fa17ae2fbe29be4ab84e89f7a4bc25dcd4c7)), closes [#33](https://github.com/adobe/helix-deploy/issues/33)

## [1.9.1](https://github.com/adobe/helix-deploy/compare/v1.9.0...v1.9.1) (2020-12-19)


### Bug Fixes

* **aws:** ensure invoke permissions for 2nd route ([2380b22](https://github.com/adobe/helix-deploy/commit/2380b22ce73ae9e0fff00f43cfcd6b2638832d74))

# [1.9.0](https://github.com/adobe/helix-deploy/compare/v1.8.1...v1.9.0) (2020-12-18)


### Bug Fixes

* **aws:** rename to AmazonWebServices to avoid conflicts with Fastly ([e606a91](https://github.com/adobe/helix-deploy/commit/e606a914419944d355c8d52440745c88e93a71a9))
* **aws:** use correct backend url ([c40e86b](https://github.com/adobe/helix-deploy/commit/c40e86b554cc6ab123a5a63fdff8dd75a71826ff))
* **fastly:** bump client ([4b4c33c](https://github.com/adobe/helix-deploy/commit/4b4c33c537e713da69dff2a4692f11be87c431e9))
* **fastly:** bump fastly client version ([4b67c66](https://github.com/adobe/helix-deploy/commit/4b67c6694fcbd2882ff8422da0e3622b7b9f38ad))
* **fastly:** change method signature ([dff81dc](https://github.com/adobe/helix-deploy/commit/dff81dcb869bcafb03fe7c9a77932042061db669))
* **fastly:** disable caching ([e373639](https://github.com/adobe/helix-deploy/commit/e373639b2802723cbbbd2b3569160e768800b5b6))
* **fastly:** guard against duplicate condition ([169007d](https://github.com/adobe/helix-deploy/commit/169007db6309c36cc201c465494c064b5dc2c96d))
* **fastly:** invoke fastly client ([2da4f6b](https://github.com/adobe/helix-deploy/commit/2da4f6ba3a71a2f6a3ef99644f35bc79219f32bc))
* **fastly:** wip towards gateway deployment ([7a39a0a](https://github.com/adobe/helix-deploy/commit/7a39a0a3bbd32635a1a70e72ef796116aef16f05))
* **index:** add scheme to returned host property ([bded43b](https://github.com/adobe/helix-deploy/commit/bded43b460ea72f9721ce2f26176fc609377650b))
* **openwhisk:** guard against hostname with protocol ([d39ab0a](https://github.com/adobe/helix-deploy/commit/d39ab0af33b01faa2ce82e7ed17681f309d25c40))


### Features

* **aws:** resolve host name from command line parameters ([22cedb7](https://github.com/adobe/helix-deploy/commit/22cedb7d8fb5704b1b8b993fbb3368850e10f0ef))
* **deploy:** invoke fastly client for gateway creation ([d761c75](https://github.com/adobe/helix-deploy/commit/d761c7514b1e692cfab619a61353d5f028d17fed))
* **fastly:** add condition to all backends ([0d55e6a](https://github.com/adobe/helix-deploy/commit/0d55e6a4b4688e0cf15bd18d7daa578b668654e8))
* **fastly:** create fastly gateway to rotate between runtimes ([2f0d3a2](https://github.com/adobe/helix-deploy/commit/2f0d3a2a09401b604b24d31326ffda91aa0606ef)), closes [#19](https://github.com/adobe/helix-deploy/issues/19)
* **fastly:** set up fastly service and log backend url ([e8c1268](https://github.com/adobe/helix-deploy/commit/e8c12685a233f9325007ee5645bffae72b7bd7f3)), closes [#14](https://github.com/adobe/helix-deploy/issues/14) [#22](https://github.com/adobe/helix-deploy/issues/22)
* **fastly:** set up health checks ([14ac57e](https://github.com/adobe/helix-deploy/commit/14ac57e9356df2b4884c8658fe6579fb498f011d))

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
