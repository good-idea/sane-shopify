# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 0.20.0 (2021-03-17)


### Features

* **sanity-plugin:** added media field to source data ([#149](https://github.com/good-idea/sane-shopify/issues/149)) ([58ed53b](https://github.com/good-idea/sane-shopify/commit/58ed53b516b958755906c97a68923091916e8533))





## 0.19.12 (2021-02-25)

**Note:** Version bump only for package sane-shopify-monorepo-root





## 0.19.11 (2021-02-24)


### Bug Fixes

* **sync-utils:** fix duplicate type import ([9d552d4](https://github.com/good-idea/sane-shopify/commit/9d552d40684dff4d590b3989777d1f4308084bb6))





## 0.19.10 (2021-02-22)

**Note:** Version bump only for package sane-shopify-monorepo-root





## 0.19.9 (2021-02-16)

**Note:** Version bump only for package sane-shopify-monorepo-root





## 0.19.8 (2021-02-10)

**Note:** Version bump only for package sane-shopify-monorepo-root





## 0.19.7 (2021-02-06)


### Bug Fixes

* **sync-utils:** dummy fix for version bump (7) ([541ae82](https://github.com/good-idea/sane-shopify/commit/541ae82f651ab49c7698c1b1c6bc7457f0b4e323))





## 0.19.6 (2021-02-06)


### Bug Fixes

* **sync-utils:** dummy fix for version bump (6) ([3778ea9](https://github.com/good-idea/sane-shopify/commit/3778ea9cf4ffcabd7edf441e1b1a166a273b1558))


## 0.19.5 (2021-02-06)


### Bug Fixes

* **sync-utils:** dummy fix for version bump (4) ([9889d3c](https://github.com/good-idea/sane-shopify/commit/9889d3c59b2a45b22dd708c8ff97c63d3507f13e))





## 0.19.4 (2021-02-06)


### Bug Fixes

* **sync-utils:** dummy fix for version bump (2) ([f5e8097](https://github.com/good-idea/sane-shopify/commit/f5e80976ea287e96d49f138628755891ca0362b7))





## 0.19.3 (2021-02-05)

**Note:** Version bump only for package sane-shopify-monorepo-root





## 0.19.2 (2021-02-05)

**Note:** Version bump only for package sane-shopify-monorepo-root





## [0.19.1](https://github.com/good-idea/sane-shopify/compare/v0.19.0...v0.19.1) (2021-01-14)


### Bug Fixes

* **server:** fetch relationships to sync ([84a65e9](https://github.com/good-idea/sane-shopify/commit/84a65e9298ff16296e547b95ec8d3b28e26d5124))
* **sync-utils:** fix relation syncing ([59a9d8b](https://github.com/good-idea/sane-shopify/commit/59a9d8b50bc9299fa14c9be35c0b23a689a82903))
* **sync-utils:** fix relationship removing ([e784922](https://github.com/good-idea/sane-shopify/commit/e78492200ac75befc4a31338b08cd8648ae4692d))
* **types:** rename collectionKeys to collectionRefs ([384ab54](https://github.com/good-idea/sane-shopify/commit/384ab5498d02a2f59dc83789c28a0fc6f229e2f4))





# [0.19.0](https://github.com/good-idea/sane-shopify/compare/v0.18.2...v0.19.0) (2021-01-14)


### Features

* **sanity-plugin:** add updatedAt to sourceData schemas ([2fa069e](https://github.com/good-idea/sane-shopify/commit/2fa069e5c881d68c434896d4a49eb9ad55a8d9e9))
* **server:** retry sync for out-of-date graphql responses ([f5f92f4](https://github.com/good-idea/sane-shopify/commit/f5f92f4d5fba1fb1224bfef0b03a212c2f05116b))
* **sync-utils:** add syncItem, fetchItemById to sync utils ([7b0e6ca](https://github.com/good-idea/sane-shopify/commit/7b0e6ca83b2dbb6ae3b0a0d26de32f6c72db0ffa))
* **types:** improve types for webhook syncing ([1bd1261](https://github.com/good-idea/sane-shopify/commit/1bd1261794fdc946ff42cde39357787e576366c5))





## [0.18.2](https://github.com/good-idea/sane-shopify/compare/v0.18.1...v0.18.2) (2020-11-18)


### Bug Fixes

* **sync-utils:** update storefront API version to 2020-10 ([30eccb1](https://github.com/good-idea/sane-shopify/commit/30eccb1a0ac864b4dff1dbcc24f7c52ade2dc292))





## [0.18.1](https://github.com/good-idea/sane-shopify/compare/v0.18.0...v0.18.1) (2020-11-18)


### Bug Fixes

* **sanity-plugin:** add currentylNotInStock to variant schema ([4166778](https://github.com/good-idea/sane-shopify/commit/41667787a44a1b58621be5eadba1b46ab91526cd))
* **sync-utils:** add currentlyNotInStock to variant query ([7a2adca](https://github.com/good-idea/sane-shopify/commit/7a2adca1236066464427059bf7278ca283dbbf8f))
* **types:** fix sanity/client type imports ([724e8b3](https://github.com/good-idea/sane-shopify/commit/724e8b3dc5733c703474436152c7fb921b96bb6a))





# [0.18.0](https://github.com/good-idea/sane-shopify/compare/v0.17.6...v0.18.0) (2020-11-08)

### Bug Fixes

- **sanity-plugin:** fix for sanity 2 ([f42bba0](https://github.com/good-idea/sane-shopify/commit/f42bba0d395086d77d5f1c8c75b21b7538360eb4))
- **sanity-plugin:** fix type error ([b2ef175](https://github.com/good-idea/sane-shopify/commit/b2ef17551f9ebc8534d760c796534ed135e3036f))
- **sync-utils:** fix cursor type errors ([9d1bb2a](https://github.com/good-idea/sane-shopify/commit/9d1bb2a608de548acd195930b96a9e445936ae2f))

### Features

- **sanity-plugin:** add presentmentPrices to sanity documents ([e30fdfc](https://github.com/good-idea/sane-shopify/commit/e30fdfc028edfd15e4a0597d63e5e6e5f27e4058)), closes [#121](https://github.com/good-idea/sane-shopify/issues/121)
- **sync-utils:** add presentmentPrices to sync ([e8e2ca0](https://github.com/good-idea/sane-shopify/commit/e8e2ca0b04df8f2aabbb01f4b3b23c35be1dcd4f))

## [0.17.6](https://github.com/good-idea/sane-shopify/compare/v0.17.5...v0.17.6) (2020-09-06)

### Bug Fixes

- **repo:** reinstall jest-cli for failing tests ([4837704](https://github.com/good-idea/sane-shopify/commit/483770465dc19c325c644d28762984904fc79d8e))
- **sanity-plugin:** fix type errors ([d141ce9](https://github.com/good-idea/sane-shopify/commit/d141ce91a73e1fb155324e52fe560edf576f7e0b))

## [0.17.5](https://github.com/good-idea/sane-shopify/compare/v0.17.4...v0.17.5) (2020-08-14)

### Bug Fixes

- **sync-utils:** prevent removal of old option entries ([c14a083](https://github.com/good-idea/sane-shopify/commit/c14a0836bcd9af1ca5a327ff33bfde747a5c72cf))

## [0.17.4](https://github.com/good-idea/sane-shopify/compare/v0.17.3...v0.17.4) (2020-08-09)

### Bug Fixes

- **sync-utils:** fix archiving when there are no relationships ([abf10b0](https://github.com/good-idea/sane-shopify/commit/abf10b034093479deeb9d530069a1a173e5ad2cd))
- **sync-utils:** fix min/maxVariantPrice with decimals ([7bc7a4e](https://github.com/good-idea/sane-shopify/commit/7bc7a4e9b0d40a232a6914de0c947beb617d2602)), closes [#117](https://github.com/good-idea/sane-shopify/issues/117)
- **sync-utils:** fix sort order of relationships ([84992a3](https://github.com/good-idea/sane-shopify/commit/84992a3d274661120eb3734d29011bf36e57b95c))
- **sync-utils:** fix type error ([495b610](https://github.com/good-idea/sane-shopify/commit/495b610e467c10f09efca9cbb30824ce5235b284))
- **sync-utils:** only archive a document if it exists ([02f9803](https://github.com/good-idea/sane-shopify/commit/02f9803a533d7aaaa966c2c3f0a5301d89dd0f31))

## [0.17.3](https://github.com/good-idea/sane-shopify/compare/v0.17.2...v0.17.3) (2020-07-20)

### Bug Fixes

- **sync-utils:** throw error when shopify fetch fails ([b29443f](https://github.com/good-idea/sane-shopify/commit/b29443f64ceafa3e25c5f1857db11bb6c4f797ac))

## [0.17.2](https://github.com/good-idea/sane-shopify/compare/v0.17.1...v0.17.2) (2020-07-20)

### Bug Fixes

- **sync-utils:** fix existing relationships syncing ([43be651](https://github.com/good-idea/sane-shopify/commit/43be6510eb2ef206e0ff2e03de6b53469d172a1b))

## [0.17.1](https://github.com/good-idea/sane-shopify/compare/v0.17.0...v0.17.1) (2020-07-17)

### Bug Fixes

- **repo:** fix package.json files ([3f9fcaa](https://github.com/good-idea/sane-shopify/commit/3f9fcaa24f5a7102bb30861b3962910348ce4fcd))

# [0.17.0](https://github.com/good-idea/sane-shopify/compare/v0.16.1...v0.17.0) (2020-07-17)

### Bug Fixes

- **sanity-plugin:** fix type errors ([5336947](https://github.com/good-idea/sane-shopify/commit/5336947c71b82e5ca8bcb6a7e8425df9cc69d1e4))
- **server:** fix type errors ([8b0e781](https://github.com/good-idea/sane-shopify/commit/8b0e781d23184634e683a7db99b9c5b51929a596))
- **sync-utils:** fix type errors ([84c5740](https://github.com/good-idea/sane-shopify/commit/84c5740809d31f9c5c51c4a56aae8bbaf0426171))
- **sync-utils:** fix window undefined error ([88d1019](https://github.com/good-idea/sane-shopify/commit/88d10194baa62d031ed636a2329474693027bc79)), closes [#115](https://github.com/good-idea/sane-shopify/issues/115)
- **types:** remove unused types ([b0873d7](https://github.com/good-idea/sane-shopify/commit/b0873d7901f3738c2bd1e5029f75e60d53a935b4))

### Features

- **server:** install sourcemap support ([cffd0df](https://github.com/good-idea/sane-shopify/commit/cffd0df36493a1180b6e8e0dc43b1cea68065206))

## [0.16.1](https://github.com/good-idea/sane-shopify/compare/v0.16.0...v0.16.1) (2020-07-12)

### Bug Fixes

- **sanity-plugin:** fix type errors ([d2ecd8f](https://github.com/good-idea/sane-shopify/commit/d2ecd8f769ec74165d3ba09fef7da564d59b76dd))
- **sync-utils:** improve type guards ([88d1101](https://github.com/good-idea/sane-shopify/commit/88d1101f0a179db01ca36bc83b9bca75b42cb538))

# [0.16.0](https://github.com/good-idea/sane-shopify/compare/v0.15.2...v0.16.0) (2020-07-12)

### Features

- **sanity-plugin:** add compareAtPriceV2 to variant source data ([d2b4202](https://github.com/good-idea/sane-shopify/commit/d2b4202da7156dfb6d38eedddde9c31c11c30583))
- **sync-utils:** add compareAtPriceV2 ([8915a92](https://github.com/good-idea/sane-shopify/commit/8915a92944bfdf090a28845b242fb7a66595a686))
- **types:** add compareAtPriceV2 to variants ([5be9d6f](https://github.com/good-idea/sane-shopify/commit/5be9d6fa5c4e3ea1e13f0863806757359e89d1a0))

## [0.15.2](https://github.com/good-idea/sane-shopify/compare/v0.15.0...v0.15.2) (2020-06-14)

### Bug Fixes

- **sync-utils:** fix related doc ordering, prevent duplicates ([32b7a7c](https://github.com/good-idea/sane-shopify/commit/32b7a7cdc3d305718682badb35488aece2852e17))

## [0.15.1](https://github.com/good-idea/sane-shopify/compare/v0.15.0...v0.15.1) (2020-06-14)

### Bug Fixes

- **sync-utils:** fix related doc ordering, prevent duplicates ([32b7a7c](https://github.com/good-idea/sane-shopify/commit/32b7a7cdc3d305718682badb35488aece2852e17))

# [0.15.0](https://github.com/good-idea/sane-shopify/compare/v0.14.1...v0.15.0) (2020-06-08)

### Bug Fixes

- **sanity-plugin:** fix initial sync issue ([c546df7](https://github.com/good-idea/sane-shopify/commit/c546df7d8354d44d699486050a67cc4020bd4472)), closes [#60](https://github.com/good-idea/sane-shopify/issues/60)
- **sanity-plugin:** fix progress indicator, improve type safety ([cab4293](https://github.com/good-idea/sane-shopify/commit/cab4293316a7f771d0650d260782eeb199bf52eb))

### Features

- **sync-utils:** type safety improvements, fix syncing problems ([ebaf0e1](https://github.com/good-idea/sane-shopify/commit/ebaf0e1969a0bffc87fdb0d733b9215dcd0fbfe0))

## [0.14.1](https://github.com/good-idea/sane-shopify/compare/v0.14.0...v0.14.1) (2020-06-04)

### Bug Fixes

- **sync-utils:** fix minVariant/maxVariant syncing ([5257571](https://github.com/good-idea/sane-shopify/commit/5257571c6021d9e9f7ec798b6330ac268341fd54))

# [0.14.0](https://github.com/good-idea/sane-shopify/compare/v0.13.1...v0.14.0) (2020-06-03)

### Features

- **sanity-plugin:** add min/max price fields to product documents ([db83ccf](https://github.com/good-idea/sane-shopify/commit/db83ccfa86e60bdf2d68164585fba6e3ecfa2216))
- **sync-utils:** parse product prices to numbers on product docs ([2a27125](https://github.com/good-idea/sane-shopify/commit/2a2712592fe2224bd5be8adaf2bdf5292c697e65))

## [0.13.1](https://github.com/good-idea/sane-shopify/compare/v0.13.0...v0.13.1) (2020-05-30)

### Bug Fixes

- **sanity-plugin:** fix some field types ([c53700f](https://github.com/good-idea/sane-shopify/commit/c53700f86c40d1ff709ac3a0a070416ec7023ef1))
- **sync-utils:** fix relationship syncing ([7d90789](https://github.com/good-idea/sane-shopify/commit/7d9078997827df11201f29b6991170ceccab25ae))

# [0.13.0](https://github.com/good-idea/sane-shopify/compare/v0.12.0...v0.13.0) (2020-05-28)

### Features

- **sanity-plugin:** use syncByID instead of byHandle ([46ebcb3](https://github.com/good-idea/sane-shopify/commit/46ebcb36d65ca345ce2858b4ac877d9f21507afc))
- **sync-utils:** remove syncByHandle ([f35ea69](https://github.com/good-idea/sane-shopify/commit/f35ea69e2b65c2e43482839a923e6db2a2e93777))
- **types:** remove syncByHandle methods ([5a3b997](https://github.com/good-idea/sane-shopify/commit/5a3b99705f4c5803b83b1d8017e5e906146433ed))

# [0.12.0](https://github.com/good-idea/sane-shopify/compare/v0.11.6...v0.12.0) (2020-05-20)

### Bug Fixes

- **sync-utils:** improve match check, reduce pagination ([78a33d6](https://github.com/good-idea/sane-shopify/commit/78a33d6a810a1b9e74475cda9615a0034e9ea843))

### Features

- **sync-utils:** delete documents, archive if they have relationships ([3133cef](https://github.com/good-idea/sane-shopify/commit/3133cefe2f1ff623266e198e7b1d12318b125420))
- **types:** update types for deleting ([d4e6fe3](https://github.com/good-idea/sane-shopify/commit/d4e6fe31683402f4f1d544db2ad30b69be0f5989))

## [0.11.6](https://github.com/good-idea/sane-shopify/compare/v0.11.5...v0.11.6) (2020-05-14)

### Bug Fixes

- **sync-utils:** reduce pagination count to 25 (helps with timeouts) ([326c388](https://github.com/good-idea/sane-shopify/commit/326c388a52e6fce5b02bb557ac17149f9d92a934))

## [0.11.5](https://github.com/good-idea/sane-shopify/compare/v0.11.4...v0.11.5) (2020-05-10)

### Bug Fixes

- **sync-utils:** fix match check ([cbce209](https://github.com/good-idea/sane-shopify/commit/cbce209fa21be267512f3d815a6657d20b4af4b1))

## [0.11.4](https://github.com/good-idea/sane-shopify/compare/v0.11.3...v0.11.4) (2020-05-10)

### Bug Fixes

- **sync-utils:** fix removing relationships on single sync ([38ef78f](https://github.com/good-idea/sane-shopify/commit/38ef78f452052311570f0f94a5087d4702636710))
- **types:** fix related doc types ([aad6ec6](https://github.com/good-idea/sane-shopify/commit/aad6ec6e9da2c6088de899d8eb64cba888b33811))

## [0.11.3](https://github.com/good-idea/sane-shopify/compare/v0.11.2...v0.11.3) (2020-05-06)

### Bug Fixes

- **sanity-plugin:** add w1200 and 1600 to schema document ([2327430](https://github.com/good-idea/sane-shopify/commit/2327430c2ff8769157efab2ab4101118fc7b7fc7))

## [0.11.2](https://github.com/good-idea/sane-shopify/compare/v0.11.1...v0.11.2) (2020-04-29)

### Bug Fixes

- **server:** better error catching for webhooks ([6da2dea](https://github.com/good-idea/sane-shopify/commit/6da2deab301fde55e2dd0696ca49222a053e3e28))
- **sync-utils:** fetch more variants, add image sizes ([4f2b304](https://github.com/good-idea/sane-shopify/commit/4f2b304e8e5611a88f89bea5b82b6dc4f5029525))
- **sync-utils:** fix empty relationships when archiving ([1935ac8](https://github.com/good-idea/sane-shopify/commit/1935ac8db7f764c0b10fba5fe1dfc5748da614d9))
- **types:** add more image sizes ([a3e88a3](https://github.com/good-idea/sane-shopify/commit/a3e88a3409c42b55b19649c3145525361968d058))

## [0.11.1](https://github.com/good-idea/sane-shopify/compare/v0.11.0...v0.11.1) (2020-04-25)

### Bug Fixes

- **sanity-plugin:** fix crashing desk tool when deleting documents ([4dd4b11](https://github.com/good-idea/sane-shopify/commit/4dd4b115affa4b2db257e2fe8bc0e49f8cf8d34e))

# [0.11.0](https://github.com/good-idea/sane-shopify/compare/v0.10.2...v0.11.0) (2020-04-25)

### Bug Fixes

- **sanity-plugin:** add archive subtitle to collections ([5e321ac](https://github.com/good-idea/sane-shopify/commit/5e321ac86e0ca8f6090773a92f5aa690473b013c))
- **sanity-plugin:** fix SyncUtils type imports ([4396f3c](https://github.com/good-idea/sane-shopify/commit/4396f3c98ae6575931dfda33cf19357efbcf8a88))
- **sync-utils:** improve relationships syncing ([6c7c671](https://github.com/good-idea/sane-shopify/commit/6c7c67184f29097f139d3cdd0a9107a97189dd8c))
- **sync-utils:** rate limit shopify API ([5b7d0ef](https://github.com/good-idea/sane-shopify/commit/5b7d0ef2570805a0839021c05ea09581ab1c3a7b))

### Features

- **server:** add webhooks ([f28a90b](https://github.com/good-idea/sane-shopify/commit/f28a90bfc325db060cf9a28a7fa9c0196f8291af))
- **types:** update types for webhooks ([58494f4](https://github.com/good-idea/sane-shopify/commit/58494f4d7de7a58fe28486d766800e62ad8fa94a))

## [0.10.2](https://github.com/good-idea/sane-shopify/compare/v0.10.1...v0.10.2) (2020-04-16)

### Bug Fixes

- **sync-utils:** fix undefined query ([c9fb82b](https://github.com/good-idea/sane-shopify/commit/c9fb82bf684026354a576a84db3a602a50d044a8))

## [0.10.1](https://github.com/good-idea/sane-shopify/compare/v0.10.0...v0.10.1) (2020-04-16)

### Bug Fixes

- **sanity-plugin:** fix prettier, ts errors ([eaa5cef](https://github.com/good-idea/sane-shopify/commit/eaa5ceffa161a4039e91f93616f393b29a1a2070))
- **server:** make pretty ([b46042e](https://github.com/good-idea/sane-shopify/commit/b46042e4d3f1f09e5c70799193ce04b12d0bd88e))
- **sync-utils:** make pretty, fix ts errors ([2f41364](https://github.com/good-idea/sane-shopify/commit/2f41364c2ba5b1061f7d20b6ef2e2bfbd530c733))
- **types:** add DocumentNode to shopify client query args ([958fe9b](https://github.com/good-idea/sane-shopify/commit/958fe9b1be73ac6494e3cc5ee98e3ba88de5b2c5))

# [0.10.0](https://github.com/good-idea/sane-shopify/compare/v0.9.0...v0.10.0) (2020-04-16)

### Bug Fixes

- **sync-utils:** fix sync item by ID ([9c5f5a5](https://github.com/good-idea/sane-shopify/commit/9c5f5a58ba6c7d41c6cc523ed5c52df1a105444d))

### Features

- **sanity-plugin:** add archived field ([6f7a0d9](https://github.com/good-idea/sane-shopify/commit/6f7a0d9c084af3fb96a47ff6d2e48f6a71ec0538))
- **sync-utils:** archive dead products, remove dead relationships ([804ca05](https://github.com/good-idea/sane-shopify/commit/804ca054c7ff4d26d6305359b90ca7fc0c8cfe62))
- **types:** update types for archiving ([e06332e](https://github.com/good-idea/sane-shopify/commit/e06332e2cf6c17d48d123ab8ba287775cf7a3043))

# [0.9.0](https://github.com/good-idea/sane-shopify/compare/v0.8.4...v0.9.0) (2020-04-07)

### Bug Fixes

- **sanity-plugin:** fix setup flow ([7534b75](https://github.com/good-idea/sane-shopify/commit/7534b75c64d56e0faebddc9b715998256163a929))

### Features

- **sync-utils:** export secrets utils ([21547f8](https://github.com/good-idea/sane-shopify/commit/21547f873159be1e319ff1c0b5aa449883d2ab1b))

## [0.8.4](https://github.com/good-idea/sane-shopify/compare/v0.8.3...v0.8.4) (2020-03-14)

### Bug Fixes

- **sanity-plugin:** move react to devDependencies ([2873492](https://github.com/good-idea/sane-shopify/commit/28734929f1de479dfbac12d5b8b0e91563c19246))
- **server:** fix tsc errors ([f32eed0](https://github.com/good-idea/sane-shopify/commit/f32eed0e84340d59dc5211c70d85063621871989))

### Features

- **types:** add description and tags to product ([e84ced5](https://github.com/good-idea/sane-shopify/commit/e84ced51ced8e28060019bcdf9170e2018ce6625))

## [0.8.3](https://github.com/good-idea/sane-shopify/compare/v0.8.2...v0.8.3) (2020-02-26)

### Bug Fixes

- **sync-utils:** preserve existing option->value fields ([6cb62ca](https://github.com/good-idea/sane-shopify/commit/6cb62caddfe7baf5321f38a3e122100daa812b2e))

## [0.8.2](https://github.com/good-idea/sane-shopify/compare/v0.8.1...v0.8.2) (2020-02-09)

### Bug Fixes

- **sync-utils:** fix collection sourceProduct edges ([2572b5a](https://github.com/good-idea/sane-shopify/commit/2572b5aad182c976c91dc293ca98b11e98f9a2d7))

## [0.8.1](https://github.com/good-idea/sane-shopify/compare/v0.8.0...v0.8.1) (2020-02-09)

### Bug Fixes

- **sanity-plugin:** fix missing fields error ([0a3ffdc](https://github.com/good-idea/sane-shopify/commit/0a3ffdc80a999ec7a116d72e055cb5d8b0c76aa6))

# [0.8.0](https://github.com/good-idea/sane-shopify/compare/v0.7.4...v0.8.0) (2020-02-09)

### Bug Fixes

- **sync-utils:** update types imports ([5e61a00](https://github.com/good-idea/sane-shopify/commit/5e61a0086c832896c0c04c296bec8877aac9a2ab))
- **types:** move shopify plugin types to types package ([0ebcf2c](https://github.com/good-idea/sane-shopify/commit/0ebcf2c20cfc1c2956845fd17cad12ec85c518e1))

### Features

- **sanity-plugin:** add product options, product option values ([ec1a222](https://github.com/good-idea/sane-shopify/commit/ec1a2227bb21c72e8e5bccc04444aaf9f3b3e237))
- **sanity-plugin:** merge in options on default fields ([6e1f9ca](https://github.com/good-idea/sane-shopify/commit/6e1f9cab4b5bf3483d5672de2461f9ac798bacb7))
- **sync-utils:** add product option syncing ([8b9b343](https://github.com/good-idea/sane-shopify/commit/8b9b34319870776639eebe2a6e7dcab2bd5bb909))
- **types:** add product option ([b8f9b29](https://github.com/good-idea/sane-shopify/commit/b8f9b2992a685c05b52e7e2edbc6e014c468907e))

## [0.7.4](https://github.com/good-idea/sane-shopify/compare/v0.7.3...v0.7.4) (2020-02-01)

### Bug Fixes

- **sanity-plugin:** update product variant id field name ([c45201b](https://github.com/good-idea/sane-shopify/commit/c45201b6cb898031626719f50725992484e087ce))
- **sync-utils:** change variant.id to variant.shopifyVariantId ([a76cc16](https://github.com/good-idea/sane-shopify/commit/a76cc1633ef754ee622439e75ae147be186d7185))

## [0.7.3](https://github.com/good-idea/sane-shopify/compare/v0.7.2...v0.7.3) (2020-01-29)

### Bug Fixes

- **sync-utils:** fix cache breaking when creating new docs ([def64b1](https://github.com/good-idea/sane-shopify/commit/def64b1acd29d6e9656f495d7ad94ad1ac7833bd))
- **sync-utils:** lower query amounts to avoid storefront api timeouts ([b7626b5](https://github.com/good-idea/sane-shopify/commit/b7626b59ac5e16bf7ccf53ad4cc65000f20b7dd3))

## [0.7.2](https://github.com/good-idea/sane-shopify/compare/v0.7.1...v0.7.2) (2020-01-27)

### Bug Fixes

- **sync-utils:** fix error when docs have no previous variants ([ac62539](https://github.com/good-idea/sane-shopify/commit/ac62539532864bde211d620ab788599b71dd4930))

## [0.7.1](https://github.com/good-idea/sane-shopify/compare/v0.7.0...v0.7.1) (2020-01-27)

### Bug Fixes

- **repo:** remove lodash-es, add sourcemaps to build ([2ce7e70](https://github.com/good-idea/sane-shopify/commit/2ce7e7008fc986682d735bba576e4d1769911468))

# [0.7.0](https://github.com/good-idea/sane-shopify/compare/v0.6.8...v0.7.0) (2020-01-25)

### Features

- variant fields ([#44](https://github.com/good-idea/sane-shopify/issues/44)) ([38a8341](https://github.com/good-idea/sane-shopify/commit/38a83410ce56ab6e9b9cf5652f26e333490d8822))

## [0.6.8](https://github.com/good-idea/sane-shopify/compare/v0.6.7...v0.6.8) (2020-01-18)

### Performance Improvements

- **sync-utils:** add caching when syncing all docs ([4b7712d](https://github.com/good-idea/sane-shopify/commit/4b7712dbdc7b611eb9e53408d0f82448fdd645dc))

## [0.6.7](https://github.com/good-idea/sane-shopify/compare/v0.6.6...v0.6.7) (2020-01-18)

### Bug Fixes

- **sync-utils:** fix error with documentByShopifyId ([bb04ad8](https://github.com/good-idea/sane-shopify/commit/bb04ad850af7e2e2ade408a9ada04a1fdbe1b8ca))

## [0.6.6](https://github.com/good-idea/sane-shopify/compare/v0.6.5...v0.6.6) (2020-01-18)

### Bug Fixes

- **sync-utils:** remove API version from URL, for now ([583ef16](https://github.com/good-idea/sane-shopify/commit/583ef167cf164d08acff2ae7ec03ce23dc46e61e))

## [0.6.5](https://github.com/good-idea/sane-shopify/compare/v0.6.4...v0.6.5) (2020-01-17)

### Bug Fixes

- **sanity-plugin:** export to both cjs and es ([dc42f8d](https://github.com/good-idea/sane-shopify/commit/dc42f8da82dd6c193fefb475ec9c3977789d6737))

## [0.6.4](https://github.com/good-idea/sane-shopify/compare/v0.6.3...v0.6.4) (2020-01-15)

**Note:** Version bump only for package sane-shopify-monorepo-root

## [0.6.3](https://github.com/good-idea/sane-shopify/compare/v0.6.2...v0.6.3) (2020-01-14)

### Bug Fixes

- **sanity-plugin:** fix dependency warning ([2f990ba](https://github.com/good-idea/sane-shopify/commit/2f990bacc97eb84c6d7bbfc5acf4cebe0d3a6ba8))

## [0.6.2](https://github.com/good-idea/sane-shopify/compare/v0.6.1...v0.6.2) (2020-01-14)

### Bug Fixes

- **repo:** fix release command ([ca51cba](https://github.com/good-idea/sane-shopify/commit/ca51cbabb4b727ade7f5951e8fe0589fa3f8bac2))
- **sanity-plugin:** cleanup temp file from version bump commit ([4d8a1fa](https://github.com/good-idea/sane-shopify/commit/4d8a1fa42bce0d73b1262490aa82dae02ab57fc7))
- **sanity-plugin:** fix for version bump ([1e7835f](https://github.com/good-idea/sane-shopify/commit/1e7835f492fce8d5b6ce69e8063d26669a697c5c))
- **sanity-plugin:** fix problem with initial sync after adding secrets ([5f80b8a](https://github.com/good-idea/sane-shopify/commit/5f80b8ae6cd45e1011278d8221d32b0df74b5a21))
- **sanity-plugin:** fix shopifyObjects exports ([7ba964a](https://github.com/good-idea/sane-shopify/commit/7ba964a3cd345e23b1c567ef0fca23a919829d9d))

## [0.6.1](https://github.com/good-idea/sane-shopify/compare/v0.6.0...v0.6.1) (2020-01-10)

### Bug Fixes

- **sync-utils:** test fix for version bump ([5deb4ef](https://github.com/good-idea/sane-shopify/commit/5deb4efe2606374f6314dfdeaf5ffc3a2a12ea71))

# [0.6.0](https://github.com/good-idea/sane-shopify/compare/v0.5.2...v0.6.0) (2020-01-10)

### Bug Fixes

- **sanity-plugin:** fix relationship syncing ([3241e0f](https://github.com/good-idea/sane-shopify/commit/3241e0f7bb1fdd38c327e827bc18d213ff2200a1))
- **sanity-plugin:** fix type errors ([be10b50](https://github.com/good-idea/sane-shopify/commit/be10b50b9f2e8eed933ed291bfe37f954f24e26d))
- **sanity-plugin:** make missing images icon ([ae2f537](https://github.com/good-idea/sane-shopify/commit/ae2f537f73a83ecab755fcce7d0dfd30250247bb))
- **sanity-plugin:** make schema graphql compatible ([d5a928b](https://github.com/good-idea/sane-shopify/commit/d5a928b67cf645006b8855c285d68b2eb162ebb5)), closes [#24](https://github.com/good-idea/sane-shopify/issues/24)
- **sanity-plugin:** update plugin for updated sync utils ([cf97051](https://github.com/good-idea/sane-shopify/commit/cf97051cc9553a3c804e54299beb98b6dbdb5a40))
- **types:** fix types for updated sync-utils ([62029e0](https://github.com/good-idea/sane-shopify/commit/62029e0906396d21d9fbb492e316a70a74164f84))

### Features

- **sanity-plugin:** update logger and activity output ([51486ef](https://github.com/good-idea/sane-shopify/commit/51486ef24c5b977b58ec94d824337283854a9d28))
- **server:** remove proxy server ([e228d32](https://github.com/good-idea/sane-shopify/commit/e228d322262cb407a4e2c0da58988898cad34503))
- **sync-utils:** improve logger output ([21a1f1d](https://github.com/good-idea/sane-shopify/commit/21a1f1db0bca693c8986dd7a93a5cfd634d065b8))
- **sync-utils:** set up logger ([de193a8](https://github.com/good-idea/sane-shopify/commit/de193a82d801e44ff6761c7a2bf42558e5fca4ef))

## [0.5.2](https://github.com/good-idea/sane-shopify/compare/v0.5.1...v0.5.2) (2019-11-10)

### Bug Fixes

- **sanity-plugin:** fix schema to work with Sanity graphql ([a64c2fc](https://github.com/good-idea/sane-shopify/commit/a64c2fc1452bf1d93973aba9a37acf954894c50c))
- **sync-utils:** update product reference fields ([421bc3a](https://github.com/good-idea/sane-shopify/commit/421bc3a643c359b8696f6e34a05747123dff696b))

## [0.5.1](https://github.com/good-idea/sane-shopify/compare/v0.5.0...v0.5.1) (2019-11-10)

**Note:** Version bump only for package sane-shopify-monorepo-root

# [0.5.0](https://github.com/good-idea/sane-shopify/compare/v0.4.0...v0.5.0) (2019-11-10)

### Features

- **sanity-plugin:** add products to collections ([305564b](https://github.com/good-idea/sane-shopify/commit/305564b59433a016144acd81808a40bdae5f9ba2))
- **sync-utils:** add product references to collections ([b2a96ec](https://github.com/good-idea/sane-shopify/commit/b2a96ec52cb8136f10c8193e017f7d469e29eb42))

# [0.4.0](https://github.com/good-idea/sane-shopify/compare/v0.3.0...v0.4.0) (2019-08-09)

### Features

- **server:** require sanity auth token for webhooks ([35b83d6](https://github.com/good-idea/sane-shopify/commit/35b83d6))

# [0.3.0](https://github.com/good-idea/sane-shopify/compare/v0.2.2...v0.3.0) (2019-08-09)

### Features

- **server:** export graphQL and webhook lambdas ([9679cac](https://github.com/good-idea/sane-shopify/commit/9679cac))

## [0.2.2](https://github.com/good-idea/sane-shopify/compare/v0.2.1...v0.2.2) (2019-06-20)

### Bug Fixes

- **sanity-plugin:** make documents graphql-compatible (2) ([ce3ce1a](https://github.com/good-idea/sane-shopify/commit/ce3ce1a))

## [0.2.1](https://github.com/good-idea/sane-shopify/compare/v0.2.0...v0.2.1) (2019-06-20)

### Bug Fixes

- **sanity-plugin:** make documents graphql-compatible ([74882ea](https://github.com/good-idea/sane-shopify/commit/74882ea))

# [0.2.0](https://github.com/good-idea/sane-shopify/compare/v0.1.5...v0.2.0) (2019-06-18)

### Bug Fixes

- **sync-utils:** fix missing image for collections ([2e8cecd](https://github.com/good-idea/sane-shopify/commit/2e8cecd))

### Features

- **sanity-plugin:** export document creators ([8f69b81](https://github.com/good-idea/sane-shopify/commit/8f69b81))

## [0.1.5](https://github.com/good-idea/sane-shopify/compare/v0.1.4...v0.1.5) (2019-06-17)

**Note:** Version bump only for package root

## [0.1.4](https://github.com/good-idea/sane-shopify/compare/v0.1.3...v0.1.4) (2019-06-16)

**Note:** Version bump only for package root

## [0.1.3](https://github.com/good-idea/sane-shopify/compare/v0.1.2...v0.1.3) (2019-06-16)

**Note:** Version bump only for package root

## [0.1.2](https://github.com/good-idea/sane-shopify/compare/v0.1.1...v0.1.2) (2019-06-16)

**Note:** Version bump only for package root

## [0.1.1](https://github.com/good-idea/sane-shopify/compare/v0.1.0...v0.1.1) (2019-06-16)

### Bug Fixes

- **repo:** update publish config for all packages ([e691515](https://github.com/good-idea/sane-shopify/commit/e691515))

# 0.1.0 (2019-06-16)

### Bug Fixes

- **plugin:** type improvements ([d351759](https://github.com/good-idea/sane-shopify/commit/d351759))
- **sanity-plugin:** fix collection loading data ([6099d88](https://github.com/good-idea/sane-shopify/commit/6099d88))
- **sanity-plugin:** fix rollup warnings ([c84cc76](https://github.com/good-idea/sane-shopify/commit/c84cc76))
- **sync-utils:** add & implement imageFragment ([4c13736](https://github.com/good-idea/sane-shopify/commit/4c13736))
- **sync-utils:** fix lodash imports, typing ([d3d31f3](https://github.com/good-idea/sane-shopify/commit/d3d31f3))
- **sync-utils:** fix rollup config ([d56f189](https://github.com/good-idea/sane-shopify/commit/d56f189))
- **sync-utils:** rename \_\_sourceInfo key to sourceData ([bb73c0c](https://github.com/good-idea/sane-shopify/commit/bb73c0c))
- **types:** export SelectedOption + ProductPriceRange ([ce0a77a](https://github.com/good-idea/sane-shopify/commit/ce0a77a))
- **types:** move Desk-tool types to plugin directory ([59d3099](https://github.com/good-idea/sane-shopify/commit/59d3099))

### Features

- **plugin:** add sync & setup panes to tool tab ([7a41ed5](https://github.com/good-idea/sane-shopify/commit/7a41ed5))
- **plugin:** clear secrets from setup ([bfe8376](https://github.com/good-idea/sane-shopify/commit/bfe8376))
- **plugin:** setup component ([882853c](https://github.com/good-idea/sane-shopify/commit/882853c))
- **sanity-plugin:** extract sync-client ([6d39d6d](https://github.com/good-idea/sane-shopify/commit/6d39d6d))
- **sanity-plugin:** report syncing in-progress ([9ffc336](https://github.com/good-idea/sane-shopify/commit/9ffc336))
- **sanity-plugin:** test of syncing (WIP) ([3903061](https://github.com/good-idea/sane-shopify/commit/3903061))
- **sanity-plugin:** update sync UI ([d88c88a](https://github.com/good-idea/sane-shopify/commit/d88c88a))
- **sync-utils:** extract sync-utils to separate package ([dba19bf](https://github.com/good-idea/sane-shopify/commit/dba19bf))
- **types:** separate types into separate package ([777bc87](https://github.com/good-idea/sane-shopify/commit/777bc87))
