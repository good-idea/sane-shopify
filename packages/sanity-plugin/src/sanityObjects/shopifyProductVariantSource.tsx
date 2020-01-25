export const selectedOptions = {
  name: 'selectedOption',
  type: 'object',
  fields: [
    { name: 'name', type: 'string' },
    { name: 'value', type: 'string' }
  ]
}

export const shopifyProductVariantSource = {
  title: 'Shopify Product Data',
  name: 'shopifyProductVariantSource',
  readOnly: true,
  type: 'object',
  fields: [
    { name: 'availableForSale', title: 'Available for Sale', type: 'boolean' },
    { name: 'id', title: 'ID', type: 'string' },
    // TODO: this will return as NULL from shopify if it does not exist.
    //       The sync plugin needs to figure out how to deal with this.
    // { name: 'compareAtPriceV2', type: 'saneMoney' },
    { name: 'image', type: 'shopifySourceImage' },
    { name: 'priceV2', type: 'saneMoney' },
    {
      name: 'selectedOptions',
      type: 'array',
      of: [{ type: 'selectedOption' }]
    },
    { name: 'requiresShipping', type: 'boolean' },
    { name: 'sku', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'weight', type: 'number' },
    { name: 'weightUnit', type: 'string' }
  ]
}
