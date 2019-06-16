import { Collection, Paginated, Product } from '@sane-shopify/types'

/**
 * Shared
 */

interface ShopifyError {
  message: string
}

const imageFragment = /* GraphQL */ `
  fragment ImageFragment on Image {
    __typename
    id
    altText
    originalSrc
    w100: transformedSrc(maxWidth: 100, crop: CENTER)
    w300: transformedSrc(maxWidth: 300, crop: CENTER)
    w800: transformedSrc(maxWidth: 800, crop: CENTER)
  }
`

/**
 * Product Queries
 */

const productFragment = /* GraphQL */ `
  fragment ProductFragment on Product {
    __typename
    id
    handle
    title
    description
    images(first: 1) {
      edges {
        cursor
        node {
          ...ImageFragment
        }
      }
    }
  }
`

export const PRODUCT_QUERY = /* GraphQL */ `
  query ProductQuery($handle: String!) {
    productByHandle(handle: $handle) {
      ...ProductFragment
    }
  }
  ${productFragment}
  ${imageFragment}
`

export interface ProductQueryResult {
  errors?: ShopifyError[]
  data?: {
    productByHandle?: Product
  }
}

export const PRODUCTS_QUERY = /* GraphQL */ `
  query ProductsQuery($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      edges {
        cursor
        node {
          ...ProductFragment
        }
      }
    }
  }
  ${productFragment}
  ${imageFragment}
`

export interface ProductsQueryResult {
  errors?: ShopifyError[]
  data?: {
    products: Paginated<Product>
  }
}

/**
 * Collection Queries
 */

const collectionFragment = /* GraphQL */ `
  fragment CollectionFragment on Collection {
    id
    handle
    title
    description
    __typename
    image {
      ...ImageFragment
    }
  }
`

export const COLLECTION_QUERY = /* GraphQL */ `
  query CollectionQuery($handle: String!) {
    collectionByHandle {
      ...CollectionFragment
    }
  }
  ${collectionFragment}
  ${imageFragment}
`

export interface CollectionQueryResult {
  errors?: ShopifyError[]
  data?: {
    collectionByHandle?: Collection
  }
}

export const COLLECTIONS_QUERY = /* GraphQL */ `
  query CollectionsQuery($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      edges {
        cursor
        node {
          ...CollectionFragment
        }
      }
    }
  }
  ${collectionFragment}
  ${imageFragment}
`

export interface CollectionsQueryResult {
  errors?: ShopifyError[]
  data?: {
    collections: Paginated<Collection>
  }
}
