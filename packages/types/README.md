# @joincivil/typescript-typings

This package is a Typescript typeRoot of typings of both common types throughout the @sane-shopify repo and external packages that otherwise have no types of their own.

Common types are exported in `types/index.ts`, and external packages are typed in `external/package-name/index.d.ts`.

## Reasoning

Some of the types are not in the main DefintelyTyped repository, while others are written by us.
We're using this package to increase velocity of updating types. Getting stuff into the main repo takes a week,
which is too slow for us at the current stage.

All of the types here are designed to not add any functionality except the one existing in the packages themselves

## Usage

Install this package.

```bash
yarn add --dev @sane-shopify/types
```

```ts
import { ShopifyClient } from '@sane-shopify/types'
```

To use the external typings, update your `tsconfig.json` to include additional type root.

```json
{
  {
  "compilerOptions": {
    "typeRoots": ["node_modules/@sane-shopify/types/external", "node_modules/@types"]
  }
}
```

Then, in your project:

```ts
import { SanityClient } from '@sanity/base'
```

(Setup adapted from [@joincivil/Civil/typescript-typings](https://github.com/joincivil/Civil/tree/master/packages/typescript-typings))
