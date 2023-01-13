import {
  Collection,
  Product,
  ShopifyMetafieldsConfig,
} from '@sane-shopify/types'
import { ShopifyUtils, ShopifyClient } from '@sane-shopify/types'
import { createFetchShopifyProduct } from './fetchShopifyProduct'
import { createFetchShopifyCollection } from './fetchShopifyCollection'
import { createFetchItemById } from './fetchItemById'
import { createFetchAllShopifyCollections } from './fetchAllShopifyCollections'
import { createFetchAllShopifyProducts } from './fetchAllShopifyProducts'
import { testSecrets } from './testSecrets'

/* eslint-disable-next-line */
require('es6-promise').polyfill()
require('isomorphic-fetch')

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

export const shopifyUtils = (
  shopifyClient: ShopifyClient,
  fetchMetafieldsConfig: () => Promise<ShopifyMetafieldsConfig>
): ShopifyUtils => {
  const cache = createCache()
  return {
    client: shopifyClient,
    fetchItemById: createFetchItemById(
      shopifyClient,
      fetchMetafieldsConfig,
      cache
    ),
    fetchShopifyProduct: createFetchShopifyProduct(
      shopifyClient,
      fetchMetafieldsConfig,
      cache
    ),
    fetchShopifyCollection: createFetchShopifyCollection(
      shopifyClient,
      fetchMetafieldsConfig,
      cache
    ),
    fetchAllShopifyProducts: createFetchAllShopifyProducts(
      shopifyClient,
      fetchMetafieldsConfig,
      cache
    ),
    fetchAllShopifyCollections: createFetchAllShopifyCollections(
      shopifyClient,
      fetchMetafieldsConfig,
      cache
    ),
    testSecrets,
  }
}
