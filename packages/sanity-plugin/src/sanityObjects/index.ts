import * as imageObjects from './shopifyImage'
import * as productObjects from './shopifyProductSource'
import * as collectionObjects from './shopifyCollectionSource'
import * as linked from './linked'
import * as connections from './connections'

export const sanityObjects = Object.values({
  ...imageObjects,
  ...productObjects,
  ...collectionObjects,
  ...linked,
  ...connections
})
