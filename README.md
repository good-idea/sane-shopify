# Sane Shopify

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-6-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

<!-- toc -->
- [Curious? 🤔](#curious-)
- [Contributing](#contributing)
- [What this project is](#what-this-project-is)
  - [Caveats](#caveats)
- [Installation & Setup](#installation--setup)
  - [Webhooks](#webhooks)
- [Usage](#usage)
  - [Collection & Product Documents](#collection--product-documents)
    - [`shopifyCollection`](#shopifycollection)
    - [`shopifyProduct`](#shopifyproduct)
  - [Extending Document and Objects](#extending-document-and-objects)
  - [Connecting to Shopify](#connecting-to-shopify)
  - [Setting up Shopify webhooks](#setting-up-shopify-webhooks)
  - [Working with the Cart](#working-with-the-cart)
- [Debugging](#debugging)
- [Alpha Changelog](#alpha-changelog)
- [Contributors ✨](#contributors-)

<!-- tocstop -->

🚨 very alpha! in active development. 🚨

All minor version changes (`0.X.0`) are likely to have breaking changes. If you are updating and have issues, see the [alpha changelog](#alpha-changelog) below.

See [this issue](https://github.com/good-idea/sane-shopify/issues/40) for the 1.0 roadmap.

This repo consists of several packages that connect [Sanity](https://www.sanity.io) and the [Shopify Storefront API](https://help.shopify.com/en/api/storefront-api).

- `@sane-shopify/sanity-plugin`: A plugin for Sanity that syncs product & collection data from Shopify to Sanity
- `@sane-shopify/server`: Webhooks for updating Sanity data when it changes in Shopify. This includes a single server as well as individual Lamdbas that can be used with AWS and Netlify.
- `@sane-shopify/sync-utils`: Utilities that are used across the packages
- `@sane-shopify/types`: Types that are used across packages.

## Curious? 🤔

If you want to be notified of updates, leave a comment in [this issue](https://github.com/good-idea/sane-shopify/issues/22).

## Contributing

All contributions are welcome! Please open issues for any ideas for what you'd like this package to do. If you want to contribute to the project, see the [Contributing](CONTRIBUTING.md) docs.

## What this project is

**Sane Shopify** was built after working around the limitations of the Shopify product & collection editor. Shopify has great e-commerce administration capabilities, but as a CMS, it's far behind solutions such as Sanity in terms of customization. Adding content beyond Shopify's defaults requires working with metafields, through 3rd-party apps or plugins. For example:

- Adding additional blocks of text content to a collection or product
- Adding a 'lookbook' gallery to a collection
- Specifying related products for a product page

This project aims to solve these problems by using Sanity to extend Shopify's Products and Collections. It does this by:

- Automatically syncing Shopify data to Sanity
- Providing a single API endpoint for both Shopify & Sanity data

This project does not:

- Sync data _to_ Shopify. Products and Collections will still need to be created in Shopify. Shopify should still be used for editing variants, prices, inventory, the configuration of Collections, and other "product catalogue" management.
- Add any e-commerce management to Sanity, such as tracking inventory, sales reports, customer management, and so on.
- Sync additional Shopify information such as Pages, Blogs, or menus.

### Caveats

- You will need to implement your own frontend, from scratch. This will not work with Shopify's themes & liquid templates.
- Many apps from the Shopify App store provide functionality to the frontend of websites by manipulating the liquid templates - these apps will not work. Other apps that enhance the admin dashboard will be unaffected.
- Shopify's built-in product analytics will not work.

---

## Installation & Setup

_New setup starting with v0.11.0_

In your Sanity installation, install the plugin: `yarn add @sane-shopify/sanity-plugin`. Once installed, add `@sane-shopify/sanity-plugin` to the list of plugins in `sanity.json`.

Add the Product and Collection documents to your schema:

- Import the `saneShopify` function
- (optional) Pass in a configuration object to extend the fields for the different object & document types

```js
// schema.js

import { saneShopify } from '@sane-shopify/sanity-plugin'

const saneShopifyConfig = {
  ... // optional. see "configuration" below
}

const saneShopifyTypes = saneShopify(saneShopifyConfig)

export default createSchema({
  name: 'default',
  types: schemaTypes.concat([
    ...saneShopifyTypes,
  ])
})
```

### Webhooks

Version 0.11.0 introduces webhooks to keep your Sanity data in sync.

For convenience, there are "pre-packaged" webhooks set up for Mirco JS (if you use Next.js) or Lambdas (for AWS, Netlify).

See the [`@sane-shopfiy/server` README](/packages/server/README.md) for instructions on setting this up.

## Usage

Sane-shopify fetches your product and collection data from Shopify's [Storefront API](https://help.shopify.com/en/api/storefront-api), and stores up-to-date copies of this information within Sanity. This means you can query your Sanity endpoint directly for all of the data you need to display products and collections.

### Collection & Product Documents

This plugin will add two document types to your schema: `shopifyCollection` and `shopifyProduct`.

#### `shopifyCollection`

The Collection document has:

- the **read-only** fields, sourced from shopify: `title`, `handle`, and `shopifyId`
- a **read-only** `products` field with an array of references to the `shopifyProduct` documents for the products in the collection.
- a **read-only** `sourceData` field which contains the data used to sync this document. This includes fields like `image`, `description`, `tags`, and so on.

#### `shopifyProduct`

The Product document has:

- the **read-only** fields, sourced from shopify: `title`, `handle`, and `shopifyId`
- a **read-only** `collections` field with an array of references to the `shopifyCollection` documents that this product belongs to.
- a **read-only** `sourceData` field which contains the data used to sync this document. This includes fields like `images`, `availableForSale`, `variants`, `tags`, and so on.
- an `options` field, which allows for custom fields for both the option (i.e. "Color") as well as option values (i.e. "Blue", "Green"). This can be helpful for instances when you would like to add things like custom descriptions or images for a particular option.
- a `variants` field, which allows for custom fields for variant. Note that Shopify creates a variant for each _combination_ of the available options.

### Extending Document and Objects

The `shopifyCollection` and `shopifyProduct` documents can be extended with custom fields or other standard Sanity configuration, such as custom previews or input components.

To set this up, create a configuration object and assign custom configuration to any of the following properties:

- `collection`: Extend the collection document
- `product`: Extend the product document
- `productOption`: Extend the product option category. (i.e. "Color")
- `productOptionValue`: Extend product option values (i.e. "Blue", "Green"). Note that this will be applied to _all_ option values, so if your product has both a "Size" and "Color" option, the fields specified here will show up in the options of both types.
- `productVariant`: Extend the product variant

Example:

```js
{
  collection: {
    // Shopify only allows a single image on collections. Here, we can add a gallery:
    fields: [
      {
        name: 'gallery',
        title: 'Gallery',
        type: 'array',
        of: [{ type: 'image' }]
      }
    ]
  },
  product: {
    fields: [
      // Shopify's HTML description input can get messy. Let's have our users enter the descriptions using Sanity's rich text instead.
      {
        name: 'description',
        title: 'Description',
        type: 'array',
        of: [{ type: 'block' }]
      },

      // Our users won't be editing fields on product variants. Let's hide that field. This will merge the "hidden" value into the sane-shoipfy defaults:
      {
        name: 'variants',
        hidden: true
      }
    ]
  },
  productVariant: {
    // Not adding anything here!
  },
  productOption: {
    // Let's make the preview for option list items a little more informative:
    preview: {
      select: {
        name: 'name',
        values: 'values'
      },
      prepare: (fields) => {
        const { name, values } = fields
        const subtitle = values.map((v) => v.value).join(' | ')
        return {
          title: name,
          subtitle
        }
      }
    }
  },
  productOptionValue: {
    // Our "Color" options will get a custom image swatch to use on the frontend

    fields: [
      {
        name: 'swatch',
        title: 'Color Swatch',
        type: 'image'
      }
    ]
  }
}
```

### Connecting to Shopify

[Set up a new app in Shopify](https://help.shopify.com/en/api/storefront-api/getting-started#storefront-api-authentication) with permissions to access the Storefront API. You'll need the Storefront Access Token (note that this is different from the Admin API key).

After you have installed the plugin and added the schema documents, open up Sanity. Click the new **🛍 Shopify** tab in the header.

Enter your Shopify storefront name and your access token in the setup pane. Once this is set up, you can click the Sync button to import your collections and products.

### Setting up Shopify webhooks

See the instructions in the [`@sane-shopify/server` Readme](packages/server/README.md)

### Working with the Cart

This plugin does not manage orders or customer carts. You will need to use Shopify's storefront API (or another solution) to do this. But, the sanity documents will include all of the product & variant IDs you need.

## Debugging

If you are experiencing issues or errors, you can get detailed logging by setting the `DEBUG` variable - either as an environment variable (for webhooks & server-side) or as a localStorage variable.

_Browser_: In your console, enter `window.localStorage.debug = 'sane-shopify:*'`
_Server_: Set an environment variable in your script (if working locally), i.e. `DEBUG=sane-shopify:* yarn start`, or add a `DEBUG` environment variable to your hosting environment.

_Scopes_:

- `sane-shopify:fetching` outputs logs for all operations fetching source data from Shopify
- `sane-shopify:patch` outputs logs for all sanity-related document patching
- `sane-shopify:server` outputs logs for all server (webhook) logs
- `sane-shopify:*` outputs all of the above

## Alpha Changelog

*0.20.0*

The config for `@sane-shopify/server` has changed. `onError` is now part of the main config object. Instead of `createWebhooks({ config, onError })`, do `createWebhooks(config)`. See the [`@sane-shopify/server` Readme](packages/server/README.md)

Source data now includes shopify media. Thanks @liqueflies for adding this!

*0.11.0*

`@sane-shopify/server` now exports functions that can be used to handle Shopify's webhooks.

*0.10.1*

The plugin now marks products that are no longer in the Shopify catalogue as archived on their corresponding sanity documents. Relationships that no longer exist in Shopify are also removed.

*0.9.0*

Fixes setup flow

*0.8.0*

_This release contains several breaking changes._

New features:

- Add fields to product options and product option values
- Simplified initial configuration

**Migrating from 0.7.x**

- Use `saneShopify(yourConfig)` instead of `createProductDocument`, `createCollectionDocument`, etc. See the updated documentation above.
- Many of the internal object type names have been modified. After you re-sync, your documents will likely have many fields that need to be unset. If you would like to completely remove all shopify collections and documents from your dataset, you can use [this gist](https://gist.github.com/good-idea/1abc5429c0c2a0be760d3a318468c750)

*0.7.0*

New features:

- Add fields to product variants

**Migrating from 0.6.x**

`@sane-shopify/sanity-plugin` now exports one more function, `createProductVariant`. Use it the same as the other exports - see the example in the usage instructions above.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://www.good-idea.studio"><img src="https://avatars.githubusercontent.com/u/11514928?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Joseph Thomas</b></sub></a><br /><a href="https://github.com/good-idea/sane-shopify/commits?author=good-idea" title="Documentation">📖</a> <a href="https://github.com/good-idea/sane-shopify/commits?author=good-idea" title="Code">💻</a> <a href="https://github.com/good-idea/sane-shopify/commits?author=good-idea" title="Tests">⚠️</a></td>
    <td align="center"><a href="http://branchlabs.com"><img src="https://avatars.githubusercontent.com/u/842883?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Graham Lipsman</b></sub></a><br /><a href="https://github.com/good-idea/sane-shopify/commits?author=GLips" title="Code">💻</a></td>
    <td align="center"><a href="https://homerjam.es"><img src="https://avatars.githubusercontent.com/u/1055769?v=4?s=100" width="100px;" alt=""/><br /><sub><b>James Homer</b></sub></a><br /><a href="https://github.com/good-idea/sane-shopify/commits?author=homerjam" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/nrgnrg"><img src="https://avatars.githubusercontent.com/u/25795402?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Richard Cooke</b></sub></a><br /><a href="https://github.com/good-idea/sane-shopify/commits?author=nrgnrg" title="Documentation">📖</a></td>
    <td align="center"><a href="https://www.loregirardi.it"><img src="https://avatars.githubusercontent.com/u/12168237?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Lorenzo Girardi</b></sub></a><br /><a href="https://github.com/good-idea/sane-shopify/commits?author=liqueflies" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/agonsgd"><img src="https://avatars.githubusercontent.com/u/80262375?v=4?s=100" width="100px;" alt=""/><br /><sub><b>agonsgd</b></sub></a><br /><a href="https://github.com/good-idea/sane-shopify/issues?q=author%3Aagonsgd" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/synim-sogody"><img src="https://avatars.githubusercontent.com/u/79842197?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Synim</b></sub></a><br /><a href="https://github.com/good-idea/sane-shopify/issues?q=author%3Asynim-sogody" title="Bug reports">🐛</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
