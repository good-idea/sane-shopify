import { Collection, Product } from '@sane-shopify/types'
import { ShopifyUtils, ShopifyClient } from '@sane-shopify/types'
import { createFetchShopifyProduct } from './fetchShopifyProduct'
import { createFetchShopifyCollection } from './fetchShopifyCollection'
import { createFetchItemById } from './fetchItemById'
import { createFetchAllShopifyCollections } from './fetchAllShopifyCollections'
import { createFetchAllShopifyProducts } from './fetchAllShopifyProducts'
import { testSecrets } from './testSecrets'

require('es6-promise').polyfill()
require('isomorphic-fetch')

type Variables = object

interface StringCache<NodeType> {
  [key: string]: NodeType | null
}

export interface ShopifyCache {
  set: (node: Product | Collection) => void
  getProductById: (id: string) => Product | null
  getProductByHandle: (handle: string) => Product | null
  getCollectionById: (id: string) => Collection | null
  getCollectionByHandle: (handle: string) => Collection | null
}

const createCache = (): ShopifyCache => {
  const collectionsById: StringCache<Collection> = {}
  const collectionsByHandle: StringCache<Collection> = {}
  const productsById: StringCache<Product> = {}
  const productsByHandle: StringCache<Product> = {}

  const getCollectionById = (id: string): Collection | null => {
    return collectionsById[id] || null
  }

  const getCollectionByHandle = (handle: string): Collection | null => {
    return collectionsByHandle[handle] || null
  }

  const getProductById = (id: string): Product | null => {
    return productsById[id] || null
  }

  const getProductByHandle = (handle: string): Product | null => {
    return productsByHandle[handle] || null
  }

  const set = (item: Collection | Product) => {
    if (item.__typename === 'Collection') {
      collectionsById[item.id] = item
      collectionsByHandle[item.handle] = item
    } else if (item.__typename === 'Product') {
      productsById[item.id] = item
      productsByHandle[item.handle] = item
    }
  }

  return {
    getProductById,
    getProductByHandle,
    getCollectionById,
    getCollectionByHandle,
    set,
  }
}

export const shopifyUtils = (client: ShopifyClient): ShopifyUtils => {
  const { query } = client
  const cache = createCache()
  return {
    client,
    fetchItemById: createFetchItemById(query, cache),
    fetchShopifyProduct: createFetchShopifyProduct(query, cache),
    fetchShopifyCollection: createFetchShopifyCollection(query, cache),
    fetchAllShopifyProducts: createFetchAllShopifyProducts(query, cache),
    fetchAllShopifyCollections: createFetchAllShopifyCollections(query, cache),
    testSecrets,
  }
}
