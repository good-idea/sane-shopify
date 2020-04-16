# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.10.0](https://github.com/good-idea/sane-shopify/compare/v0.9.0...v0.10.0) (2020-04-16)

### Bug Fixes

- **sync-utils:** fix sync item by ID ([9c5f5a5](https://github.com/good-idea/sane-shopify/commit/9c5f5a58ba6c7d41c6cc523ed5c52df1a105444d))

### Features

- **sync-utils:** archive dead products, remove dead relationships ([804ca05](https://github.com/good-idea/sane-shopify/commit/804ca054c7ff4d26d6305359b90ca7fc0c8cfe62))

# [0.9.0](https://github.com/good-idea/sane-shopify/compare/v0.8.4...v0.9.0) (2020-04-07)

### Features

- **sync-utils:** export secrets utils ([21547f8](https://github.com/good-idea/sane-shopify/commit/21547f873159be1e319ff1c0b5aa449883d2ab1b))

## [0.8.4](https://github.com/good-idea/sane-shopify/compare/v0.8.3...v0.8.4) (2020-03-14)

**Note:** Version bump only for package @sane-shopify/sync-utils

## [0.8.3](https://github.com/good-idea/sane-shopify/compare/v0.8.2...v0.8.3) (2020-02-26)

### Bug Fixes

- **sync-utils:** preserve existing option->value fields ([6cb62ca](https://github.com/good-idea/sane-shopify/commit/6cb62caddfe7baf5321f38a3e122100daa812b2e))

## [0.8.2](https://github.com/good-idea/sane-shopify/compare/v0.8.1...v0.8.2) (2020-02-09)

### Bug Fixes

- **sync-utils:** fix collection sourceProduct edges ([2572b5a](https://github.com/good-idea/sane-shopify/commit/2572b5aad182c976c91dc293ca98b11e98f9a2d7))

# [0.8.0](https://github.com/good-idea/sane-shopify/compare/v0.7.4...v0.8.0) (2020-02-09)

### Bug Fixes

- **sync-utils:** update types imports ([5e61a00](https://github.com/good-idea/sane-shopify/commit/5e61a0086c832896c0c04c296bec8877aac9a2ab))

### Features

- **sync-utils:** add product option syncing ([8b9b343](https://github.com/good-idea/sane-shopify/commit/8b9b34319870776639eebe2a6e7dcab2bd5bb909))

## [0.7.4](https://github.com/good-idea/sane-shopify/compare/v0.7.3...v0.7.4) (2020-02-01)

### Bug Fixes

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

## [0.6.4](https://github.com/good-idea/sane-shopify/compare/v0.6.3...v0.6.4) (2020-01-15)

**Note:** Version bump only for package @sane-shopify/sync-utils

## [0.6.1](https://github.com/good-idea/sane-shopify/compare/v0.6.0...v0.6.1) (2020-01-10)

### Bug Fixes

- **sync-utils:** test fix for version bump ([5deb4ef](https://github.com/good-idea/sane-shopify/commit/5deb4efe2606374f6314dfdeaf5ffc3a2a12ea71))

# [0.6.0](https://github.com/good-idea/sane-shopify/compare/v0.5.2...v0.6.0) (2020-01-10)

### Bug Fixes

- **sanity-plugin:** fix relationship syncing ([3241e0f](https://github.com/good-idea/sane-shopify/commit/3241e0f7bb1fdd38c327e827bc18d213ff2200a1))

### Features

- **sync-utils:** improve logger output ([21a1f1d](https://github.com/good-idea/sane-shopify/commit/21a1f1db0bca693c8986dd7a93a5cfd634d065b8))
- **sync-utils:** set up logger ([de193a8](https://github.com/good-idea/sane-shopify/commit/de193a82d801e44ff6761c7a2bf42558e5fca4ef))

## [0.5.2](https://github.com/good-idea/sane-shopify/compare/v0.5.1...v0.5.2) (2019-11-10)

### Bug Fixes

- **sync-utils:** update product reference fields ([421bc3a](https://github.com/good-idea/sane-shopify/commit/421bc3a643c359b8696f6e34a05747123dff696b))

## [0.5.1](https://github.com/good-idea/sane-shopify/compare/v0.5.0...v0.5.1) (2019-11-10)

**Note:** Version bump only for package @sane-shopify/sync-utils

# [0.5.0](https://github.com/good-idea/sane-shopify/compare/v0.4.0...v0.5.0) (2019-11-10)

### Features

- **sync-utils:** add product references to collections ([b2a96ec](https://github.com/good-idea/sane-shopify/commit/b2a96ec52cb8136f10c8193e017f7d469e29eb42))

# [0.4.0](https://github.com/good-idea/sane-shopify/compare/v0.3.0...v0.4.0) (2019-08-09)

**Note:** Version bump only for package @sane-shopify/sync-utils

# [0.3.0](https://github.com/good-idea/sane-shopify/compare/v0.2.2...v0.3.0) (2019-08-09)

### Features

- **server:** export graphQL and webhook lambdas ([9679cac](https://github.com/good-idea/sane-shopify/commit/9679cac))

# [0.2.0](https://github.com/good-idea/sane-shopify/compare/v0.1.5...v0.2.0) (2019-06-18)

### Bug Fixes

- **sync-utils:** fix missing image for collections ([2e8cecd](https://github.com/good-idea/sane-shopify/commit/2e8cecd))

## [0.1.5](https://github.com/good-idea/sane-shopify/compare/v0.1.4...v0.1.5) (2019-06-17)

**Note:** Version bump only for package @sane-shopify/sync-utils

## [0.1.4](https://github.com/good-idea/sane-shopify/compare/v0.1.3...v0.1.4) (2019-06-16)

**Note:** Version bump only for package @sane-shopify/sync-utils

## [0.1.3](https://github.com/good-idea/sane-shopify/compare/v0.1.2...v0.1.3) (2019-06-16)

**Note:** Version bump only for package @sane-shopify/sync-utils

## [0.1.2](https://github.com/good-idea/sane-shopify/compare/v0.1.1...v0.1.2) (2019-06-16)

**Note:** Version bump only for package @sane-shopify/sync-utils

## [0.1.1](https://github.com/good-idea/sane-shopify/compare/v0.1.0...v0.1.1) (2019-06-16)

### Bug Fixes

- **repo:** update publish config for all packages ([e691515](https://github.com/good-idea/sane-shopify/commit/e691515))

# 0.1.0 (2019-06-16)

### Bug Fixes

- **sync-utils:** add & implement imageFragment ([4c13736](https://github.com/good-idea/sane-shopify/commit/4c13736))
- **sync-utils:** fix lodash imports, typing ([d3d31f3](https://github.com/good-idea/sane-shopify/commit/d3d31f3))
- **sync-utils:** fix rollup config ([d56f189](https://github.com/good-idea/sane-shopify/commit/d56f189))
- **sync-utils:** rename \_\_sourceInfo key to sourceData ([bb73c0c](https://github.com/good-idea/sane-shopify/commit/bb73c0c))

### Features

- **sync-utils:** extract sync-utils to separate package ([dba19bf](https://github.com/good-idea/sane-shopify/commit/dba19bf))
