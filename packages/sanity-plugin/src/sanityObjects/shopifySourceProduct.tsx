import { ShopifySourceProductPreview } from '../components'

export const shopifySourceProductOption = {
  name: 'shopifySourceProductOption',
  type: 'object',
  fields: [
    {
      name: 'name',
      type: 'string',
    },
    {
      name: 'values',
      type: 'array',
      of: [{ type: 'string' }],
    },
  ],
}

export const shopifyMoneyV2 = {
  name: 'shopifyMoneyV2',
  type: 'object',
  fields: [
    {
      name: 'amount',
      type: 'string',
    },
    {
      name: 'currencyCode',
      type: 'string',
    },
  ],
}

export const shopifySourceProductPriceRange = {
  name: 'shopifySourceProductPriceRange',
  type: 'object',
  fields: [
    {
      name: 'minVariantPrice',
      type: 'shopifyMoneyV2',
    },
    {
      name: 'maxVariantPrice',
      type: 'shopifyMoneyV2',
    },
  ],
}

export const shopifySourceCollectionNode = {
  name: 'shopifySourceCollectionNode',
  type: 'object',
  fields: [
    {
      name: 'handle',
      type: 'string',
    },
    {
      name: 'id',
      type: 'string',
    },
  ],
}

export const shopifySourceCollectionEdge = {
  name: 'shopifySourceCollectionEdge',
  type: 'object',
  fields: [
    {
      name: 'cursor',
      type: 'string',
      title: 'Cursor',
    },
    {
      name: 'node',
      type: 'shopifySourceCollectionNode',
    },
  ],
}

export const shopifySourceCollectionsConnection = {
  name: 'shopifySourceCollectionsConnection',
  type: 'object',
  fields: [
    {
      name: 'pageInfo',
      type: 'pageInfo',
    },
    {
      name: 'edges',
      type: 'array',
      of: [{ type: 'shopifySourceCollectionEdge' }],
    },
  ],
}

export const shopifySourceProductVariantEdge = {
  name: 'shopifySourceProductVariantEdge',
  type: 'object',
  fields: [
    { name: 'cursor', type: 'string' },
    { name: 'node', type: 'shopifySourceProductVariant' },
  ],
}

export const shopifySourceProductVariantEdges = {
  name: 'shopifySourceProductVariantEdges',
  type: 'array',
  of: [{ type: 'shopifySourceProductVariantEdge' }],
}

export const shopifySourceProductVariantsConnection = {
  name: 'shopifySourceProductVariantsConnection',
  type: 'object',
  fields: [
    {
      name: 'pageInfo',
      type: 'pageInfo',
    },
    {
      name: 'edges',
      type: 'shopifySourceProductVariantEdges',
    },
  ],
}

export const shopifyProductSource = {
  title: 'Shopify Product Data',
  name: 'shopifySourceProduct',
  readOnly: true,
  type: 'object',
  inputComponent: ShopifySourceProductPreview,
  fields: [
    { title: 'Title', name: 'title', type: 'string' },
    { name: 'availableForSale', title: 'Available for Sale', type: 'boolean' },
    {
      name: 'priceRange',
      title: 'Price Range',
      hidden: true,
      type: 'shopifySourceProductPriceRange',
    },
    {
      name: 'productType',
      title: 'Product Type',
      type: 'string',
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      title: 'Handle',
      name: 'handle',
      type: 'string',
    },
    {
      title: 'Description',
      name: 'description',
      type: 'text',
      rows: 3,
    },
    {
      title: 'Description (HTML)',
      name: 'descriptionHtml',
      type: 'text',
      rows: 3,
      hidden: true,
    },
    {
      title: 'Vendor',
      name: 'vendor',
      type: 'string',
      hidden: true,
    },
    {
      title: 'ID',
      name: 'id',
      type: 'string',
      hidden: true,
    },
    {
      title: 'Images',
      name: 'images',
      type: 'shopifySourceImages',
      hidden: true,
    },
    {
      title: 'Options',
      name: 'options',
      type: 'array',
      hidden: true,
      of: [{ type: 'shopifySourceProductOption' }],
    },
    {
      title: 'Variants',
      name: 'variants',
      type: 'shopifySourceProductVariantsConnection',
      hidden: true,
    },
    {
      title: 'Collections',
      name: 'collections',
      type: 'shopifySourceCollectionsConnection',
      hidden: true,
    },
  ],
}
