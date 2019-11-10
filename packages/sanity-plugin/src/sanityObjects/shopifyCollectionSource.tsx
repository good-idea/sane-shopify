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
    }
  ]
}
