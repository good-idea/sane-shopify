import * as imageObjects from './shopifyImage'
import * as productObjects from './shopifyProductSource'
import * as collectionObjects from './shopifyCollectionSource'

export const sanityObjects = Object.values({
  ...imageObjects,
  ...productObjects,
  ...collectionObjects
})
