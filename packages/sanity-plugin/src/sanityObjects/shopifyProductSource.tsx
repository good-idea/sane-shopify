export const saneProductOption = {
  name: 'saneProductOption',
  type: 'object',
  fields: [
    {
      name: 'name',
      type: 'string'
    },
    {
      name: 'values',
      type: 'array',
      of: [{ type: 'string' }]
    }
  ]
}

export const saneMoney = {
  name: 'saneMoney',
  type: 'object',
  fields: [
    {
      name: 'amount',
      type: 'string'
    },
    {
      name: 'currencyCode',
      type: 'string'
    }
  ]
}

export const saneProductPriceRange = {
  name: 'saneProductPriceRange',
  type: 'object',
  fields: [
    {
      name: 'minVariantPrice',
      type: 'saneMoney'
    },
    {
      name: 'maxVariantPrice',
      type: 'saneMoney'
    }
  ]
}

export const shopifyProductSource = {
  title: 'Shopify Product Data',
  name: 'shopifyProductSource',
  readOnly: true,
  type: 'object',
  fields: [
    { title: 'Title', name: 'title', type: 'string' },
    { name: 'availableForSale', title: 'Available for Sale', type: 'boolean' },
    {
      name: 'options',
      title: 'Product Options',
      hidden: true,
      type: 'array',
      of: [{ type: 'saneProductOption' }]
    },
    {
      name: 'priceRange',
      title: 'Price Range',
      hidden: true,
      type: 'saneProductPriceRange'
    },
    {
      name: 'productType',
      title: 'Product Type',
      hidden: true,
      type: 'string'
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      hidden: true,
      of: [{ type: 'string' }]
    },
    {
      title: 'Handle',
      name: 'handle',
      type: 'string'
      // hidden: true,
    },
    {
      title: 'Description',
      name: 'description',
      type: 'text',
      rows: 3
    },
    {
      title: 'ID',
      name: 'id',
      type: 'string',
      hidden: true
    },
    {
      title: 'Images',
      name: 'images',
      type: 'shopifySourceImages',
      hidden: true
    },
    {
      title: 'Collections',
      name: 'collections',
      // hidden: true,
      type: 'object',
      fields: [
        {
          name: 'pageInfo',
          type: 'object',
          fields: [
            {
              name: 'hasNextPage',
              type: 'boolean'
            },
            {
              name: 'hasPreviousPage',
              type: 'boolean'
            }
          ]
        },
        {
          name: 'edges',
          type: 'array',
          of: [
            {
              name: 'edge',
              type: 'object',
              fields: [
                {
                  name: 'cursor',
                  type: 'string'
                },
                {
                  name: 'node',
                  type: 'object',
                  fields: [
                    {
                      name: 'handle',
                      type: 'string'
                    },
                    {
                      name: 'id',
                      type: 'string'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
