import { Collection, Paginated, Product } from '@sane-shopify/types'

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
        node {
          id
          altText
          originalSrc
          transformedSrc(maxWidth: 100)
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
`

export interface ProductQueryResult {
  data: {
    productByHandle: Product
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
`

export interface ProductsQueryResult {
  data: {
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
      id
      altText
      originalSrc
      transformedSrc(maxWidth: 100)
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
`

export interface CollectionQueryResult {
  data: {
    collectionByHandle: Collection
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
`

export interface CollectionsQueryResult {
  data: {
    collections: Paginated<Collection>
  }
}
