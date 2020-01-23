export const shopifyProductVariantSource = {
  title: 'Shopify Product Data',
  name: 'shopifyProductVariantSource',
  readOnly: true,
  type: 'object',
  fields: [
    { name: 'availableForSale', title: 'Available for Sale', type: 'boolean' },
    { name: 'id', title: 'ID', type: 'string' },
    { name: 'compareAtPriceV2', type: 'saneMoney' },
    { name: 'image', type: 'shopifySourceImage' },
    { name: 'priceV2', type: 'saneMoney' },
    { name: 'requiresShipping', type: 'boolean' },
    { name: 'sku', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'weight', type: 'number' },
    { name: 'weightUnit', type: 'string' }
  ]
}
