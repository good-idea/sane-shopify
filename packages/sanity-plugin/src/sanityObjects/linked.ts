export const linkedCollections = {
  name: 'linkedCollections',
  description: 'Synced from Shopify',
  type: 'array',
  readOnly: true,
  of: [
    {
      type: 'reference',
      to: [
        {
          type: 'shopifyCollection'
        }
      ]
    }
  ]
}
