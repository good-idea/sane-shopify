import gql from 'graphql-tag'

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

export const productVariantFragment = gql`
  fragment ProductVariantFragment on ProductVariant {
    availableForSale
    id
    image {
      ...ImageFragment
    }
    priceV2 {
      ...MoneyV2Fragment
    }
    selectedOptions {
      value
      name
    }
    requiresShipping
    sku
    title
    weight
    weightUnit
  }
`

export const productFragment = gql`
  fragment ProductFragment on Product {
    __typename
    id
    handle
    title
    description
    descriptionHtml
    availableForSale
    productType
    tags
    options {
      id
      name
      values
    }
    variants(first: 20) {
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      edges {
        cursor
        node {
          ...ProductVariantFragment
        }
      }
    }
    priceRange {
      minVariantPrice {
        ...MoneyV2Fragment
      }
      maxVariantPrice {
        ...MoneyV2Fragment
      }
    }
    images(first: 50) {
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
  ${productVariantFragment}
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
    descriptionHtml
    __typename
    image {
      ...ImageFragment
    }
  }
  ${imageFragment}
`
