export const shopifyCollectionSource = {
  title: 'Shopify Data',
  readOnly: true,
  name: 'shopifyCollectionSource',
  type: 'object',
  fields: [
    { title: 'Title', name: 'title', type: 'string' },
    {
      title: 'Handle',
      name: 'handle',
      type: 'string',
      hidden: true
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
      title: 'Image',
      name: 'image',
      type: 'shopifySourceImage',
      hidden: true
    },
    {
      title: 'Products',
      name: 'products',
      hidden: true,
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
