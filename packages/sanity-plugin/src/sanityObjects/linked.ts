export const linkedCollections = {
  name: 'linkedCollections',
  description: 'Synced from Shopify',
  type: 'array',
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
