export const linkedCollections = {
  name: 'linkedCollections',
  description: 'Synced from Shopify',
  title: 'Collections',
  type: 'array',
  options: {
    sortable: false,
  },
  readOnly: true,
  of: [
    {
      type: 'reference',
      to: [
        {
          type: 'shopifyCollection',
        },
      ],
    },
  ],
}

export const linkedProducts = {
  name: 'linkedProducts',
  title: 'Products',
  description: 'Synced from Shopify',
  type: 'array',
  options: {
    sortable: false,
  },
  readOnly: true,
  of: [
    {
      type: 'reference',
      to: [
        {
          type: 'shopifyProduct',
        },
      ],
    },
  ],
}
