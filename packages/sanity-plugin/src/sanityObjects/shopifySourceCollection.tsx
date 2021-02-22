import { ShopifySourceCollectionPreview } from '../components'

export const shopifySourceProductNode = {
  title: 'Shopify Source Product Node',
  name: 'shopifySourceProductNode',
  type: 'object',
  fields: [
    { name: 'handle', type: 'string' },
    { name: 'id', type: 'string' },
  ],
}

export const shopifySourceProductEdge = {
  title: 'Shopify Source Product Edge',
  name: 'shopifySourceProductEdge',
  type: 'object',
  fields: [
    {
      name: 'cursor',
      type: 'string',
      title: 'Cursor',
    },
    {
      name: 'node',
      type: 'shopifySourceProductNode',
    },
  ],
}

export const shopifySourceProductsConnection = {
  title: 'Shopify Source Products Connection',
  name: 'shopifySourceProductsConnection',
  type: 'object',
  fields: [
    {
      name: 'pageInfo',
      type: 'pageInfo',
    },
    {
      name: 'edges',
      type: 'array',
      of: [
        {
          type: 'shopifySourceProductEdge',
        },
      ],
    },
  ],
}

export const shopifyCollectionSource = {
  title: 'Shopify Data',
  readOnly: true,
  name: 'shopifySourceCollection',
  type: 'object',
  options: {
    collapsible: true,
    collapsed: true,
  },
  inputComponent: ShopifySourceCollectionPreview,
  fields: [
    { title: 'Title', name: 'title', type: 'string' },
    {
      title: 'Updated At',
      name: 'updatedAt',
      type: 'date',
      readOnly: true,
      hidden: true,
    },
    {
      title: 'Handle',
      name: 'handle',
      type: 'string',
      hidden: true,
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
      title: 'ID',
      name: 'id',
      type: 'string',
      hidden: true,
    },
    {
      title: 'Image',
      name: 'image',
      type: 'shopifySourceImage',
      hidden: true,
    },
    {
      title: 'Products',
      name: 'products',
      type: 'shopifySourceProductsConnection',
      hidden: true,
    },
  ],
}
