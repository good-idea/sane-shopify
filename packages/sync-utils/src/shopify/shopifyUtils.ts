import { ShopifyUtils, ShopifyClient } from '@sane-shopify/types'
import { createFetchShopifyProduct } from './fetchShopifyProduct'
import { createFetchShopifyCollection } from './fetchShopifyCollection'
import { createFetchItemById } from './fetchItemById'
import { createFetchAllShopifyCollections } from './fetchAllShopifyCollections'
import { createFetchAllShopifyProducts } from './fetchAllShopifyProducts'

require('es6-promise').polyfill()
require('isomorphic-fetch')

type Variables = object

export const shopifyUtils = (client: ShopifyClient): ShopifyUtils => {
  const { query } = client
  return {
    query,
    fetchItemById: createFetchItemById(query),
    fetchShopifyProduct: createFetchShopifyProduct(query),
    fetchShopifyCollection: createFetchShopifyCollection(query),
    fetchAllShopifyProducts: createFetchAllShopifyProducts(query),
    fetchAllShopifyCollections: createFetchAllShopifyCollections(query)
  }
}
