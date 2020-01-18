import gql from 'graphql-tag'
import { Collection } from '@sane-shopify/types'

/**
 * Shared
 */

const moneyFragment = /* GraphQL */ `
  fragment MoneyV2Fragment on MoneyV2 {
    amount
    currencyCode
  }
`

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

export const productFragment = gql`
  fragment ProductFragment on Product {
    __typename
    id
    handle
    title
    description
    availableForSale
    productType
    tags
    options {
      id
      name
      values
    }
    priceRange {
      minVariantPrice {
        ...MoneyV2Fragment
      }
      maxVariantPrice {
        ...MoneyV2Fragment
      }
    }
    images(first: 100) {
      edges {
        cursor
        node {
          ...ImageFragment
        }
      }
    }
  }
  ${moneyFragment}
  ${imageFragment}
`

/**
 * Collection Queries
 */

export const collectionFragment = /* GraphQL */ `
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
  ${imageFragment}
`
