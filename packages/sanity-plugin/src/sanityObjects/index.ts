import * as imageObjects from './shopifyImage'
import * as productObjects from './shopifySourceProduct'
import * as productVariantObjects from './shopifySourceProductVariant'
import * as collectionObjects from './shopifySourceCollection'
import * as linked from './linked'
import * as connections from './connections'

export const saneShopifyObjects = Object.values({
  ...imageObjects,
  ...productObjects,
  ...productVariantObjects,
  ...collectionObjects,
  ...linked,
  ...connections,
})
