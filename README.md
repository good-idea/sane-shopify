# Sane Shopify

🚨 very alpha! in active development. 🚨

To-do before major release:

- [x] Create references between products & collections within Sanity
- [ ] Set up webhooks to sync when data changes in Shopify
- [ ] Archive Sanity documents when items have been deleted in Shopify

Coming up:

- [ ] Extend fields on product variants

This repo consists of several packages that connect [Sanity](https://www.sanity.io) and the [Shopify Storefront API](https://help.shopify.com/en/api/storefront-api).

- `@sane-shopify/sanity-plugin`: A plugin for Sanity that syncs product & collection data from Shopify to Sanity
- `@sane-shopify/server`: Webhooks for updating Sanity data when it changes in Shopify. This includes a single server as well as individual Lamdbas that can be used with AWS and Netlify.
- `@sane-shopify/sync-utils`: Utilities that are used across the packages
- `@sane-shopify/types`: Types that are used across packages.

## Curious? 🤔

If you want to be notified of updates, leave a comment in [this issue](https://github.com/good-idea/sane-shopify/issues/22).

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

## Caveats

- You will need to implement your own frontend, from scratch. This will not work with Shopify's themes & liquid templates.
- Many apps from the Shopify App store provide functionality to the frontend of websites by manipulating the liquid templates - these apps will not work. Other apps that enhance the admin dashboard will be unaffected.
- Shopify's built-in product analytics will not work.

---

# Installation & Setup

In your Sanity installation, install the plugin: `yarn add @sane-shopify/sanity-plugin`. Once installed, add `@sane-shopify/sanity-plugin` to the list of plugins in `sanity.json`.

Add the Product and Collection documents to your schema:

- Import the `sanityObjects` array
- Import `createProductDocument` and `createCollectionDocument` from `@sane-shopify/sanity-plugin`. Use these to create the bare document types. (See more on these functions below)
- Add all of the above to your schema. `sanityObjects` is required.

```js
import { createProductDocument, createCollectionDocument, saneShopifyObjects } from '@sane-shopify/sanity-plugin'

const product = createProductDocument()
const collection = createCollectionDocument()

export default createSchema({
  name: 'default',
  types: schemaTypes.concat([
    /* Your types here! */
    ...saneShopifyObjects,
    product,
    collection
  ]),
}/)
```

To add additional fields to these documents, see the docs on `createProductDocument` and `createCollectionDocument` below.

## Connecting to Shopify

[Set up a new app in Shopify](https://help.shopify.com/en/api/storefront-api/getting-started#storefront-api-authentication) with permissions to access the Storefront API. You'll need the Storefront Access Token (note that this is different from the Admin API key).

After you have installed the plugin and added the schema documents, open up Sanity. Click the new **🛍 Shopify** tab in the header.

Enter your Shopify storefront name and your access token in the setup pane. Once this is set up, you can click the Sync button to import your collections and products.

## Setting up Shopify webhooks

#### TODO

---

# Usage

Sane-shopify fetches your product and collection data from Shopify's [Storefront API](https://help.shopify.com/en/api/storefront-api), and stores up-to-date copies of this information within Sanity. This means you can query your Sanity endpoint directly for all of the data you need to display products and collections.

## Document Structure

`shopifyProduct` & `shopifyProduct`

The two document types have a number of read-only fields:

```
{
  title: 'Product Title',
  handle: 'product-title',
  /* The product's ID in the Storefront API */
  shopifyId: 'Zf5n....',
  /* Other product data such as description, images, price, variants, etc */
  sourceData: { ... },
  /* (shopifyProduct only) An array of references to the corresponding collection documents in sanity */
  collections: [ ... ],

  /* (shopifyCollection only) An array of references to the corresponding product documents in sanity */
  products: [ ... ],

  /* Any additional custom fields you add to these document types */

}
```

## Working with the Cart

This plugin does not manage orders or customer carts. You will need to use Shopify's storefront API (or another solution) to do this. But, the sanity documents will include all of the product & variant IDs you need.

---

# API Reference

#### `createProductDocument` and `createCollectionDocument`

Both Collection and Document types come with some default document configuration. To extend these, just pass in standard Sanity document configuration. Any `fields` you pass in will be appended to the default fields. Other properties will overwrite the defaults. The two fields that can not be changed are `type` and `name`.

Example:

```js
const document = createProductDocument({
  title: 'Shoe'
  fields: [
    {
      name: 'sizingInfo'
      type: 'textarea',
      title: 'Sizing Information'
    },
  ],
})
```
