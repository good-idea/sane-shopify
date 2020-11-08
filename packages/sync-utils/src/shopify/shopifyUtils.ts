import {
  ProgressHandler,
  ShopifyItemParams,
  Collection,
  Product,
  ShopifyClient,
  ShopifySecrets,
} from '@sane-shopify/types'
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

interface ShopifyItemParams {
  id?: string
  handle?: string
}

export interface TestSecretsResponse {
  message: string
  isError: boolean
}

export interface ShopifyUtils {
  client: ShopifyClient
  fetchItemById: (
    id: string,
    withRelated: boolean,
    onProgress: ProgressHandler<Product>
  ) => Promise<Product | Collection | null>
  fetchShopifyProduct: (args: ShopifyItemParams) => Promise<Product | null>
  fetchShopifyCollection: (
    args: ShopifyItemParams
  ) => Promise<Collection | null>
  fetchAllShopifyProducts: (
    onProgress: ProgressHandler<Product>
  ) => Promise<Product[]>
  fetchAllShopifyCollections: (
    onProgress: ProgressHandler<Collection>
  ) => Promise<Collection[]>
  testSecrets: (secrets: ShopifySecrets) => Promise<TestSecretsResponse>
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
