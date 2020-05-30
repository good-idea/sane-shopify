export const selectedOptions = {
  name: 'shopifySourceSelectedOption',
  type: 'object',
  fields: [
    { name: 'name', type: 'string' },
    { name: 'value', type: 'string' },
  ],
}

export const shopifySourceProductVariant = {
  title: 'Shopify Product Data',
  name: 'shopifySourceProductVariant',
  readOnly: true,
  type: 'object',
  options: {
    collapsible: true,
    collapsed: true,
  },
  fields: [
    { name: 'availableForSale', title: 'Available for Sale', type: 'boolean' },
    { name: 'id', title: 'ID', type: 'string' },
    // TODO: this will return as NULL from shopify if it does not exist.
    //       The sync plugin needs to figure out how to deal with this.
    { name: 'image', type: 'shopifySourceImage' },
    { name: 'priceV2', type: 'shopifyMoneyV2' },
    {
      name: 'selectedOptions',
      type: 'array',
      of: [{ type: 'shopifySourceSelectedOption' }],
    },
    { name: 'requiresShipping', type: 'boolean' },
    { name: 'sku', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'weight', type: 'number' },
    { name: 'weightUnit', type: 'string' },
  ],
  preview: {
    select: { title: 'title' },
  },
}
