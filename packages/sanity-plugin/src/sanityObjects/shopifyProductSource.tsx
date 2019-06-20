export const shopifyProductSource = {
  title: 'Shopify Product Data',
  name: 'shopifyProductSource',
  readOnly: true,
  type: 'object',
  fields: [
    { title: 'Title', name: 'title', type: 'string' },
    {
      title: 'Handle',
      name: 'handle',
      type: 'string'
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
      type: 'shopifySourceImages'
    }
  ]
}
