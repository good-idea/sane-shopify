import { MetafieldConfig, ShopifyConfigProducts } from '@sane-shopify/types'
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

const mediaImageFragment = /* GraphQL */ `
  fragment MediaImageFragment on MediaImage {
    image {
      __typename
      id
      altText
      originalSrc
      w100: transformedSrc(maxWidth: 100, crop: CENTER)
      w300: transformedSrc(maxWidth: 300, crop: CENTER)
      w800: transformedSrc(maxWidth: 800, crop: CENTER)
      w1200: transformedSrc(maxWidth: 1200, crop: CENTER)
      w1600: transformedSrc(maxWidth: 1600, crop: CENTER)
    }
  }
`

const videoFragment = /* GraphQL */ `
  fragment VideoFragment on Video {
    id
    alt
    sources {
      url
      format
      mimeType
    }
  }
`

const imageFragment = /* GraphQL */ `
  fragment ImageFragment on Image {
    __typename
    id
    altText
    originalSrc
    w100: transformedSrc(maxWidth: 100, crop: CENTER)
    w300: transformedSrc(maxWidth: 300, crop: CENTER)
    w800: transformedSrc(maxWidth: 800, crop: CENTER)
    w1200: transformedSrc(maxWidth: 1200, crop: CENTER)
    w1600: transformedSrc(maxWidth: 1600, crop: CENTER)
  }
`

/**
 * Product Queries
 */

export const createProductVariantFragment = (
  shopifyConfigProducts?: ShopifyConfigProducts
) => gql`
  fragment ProductVariantFragment on ProductVariant {
    availableForSale
    currentlyNotInStock
    id
    image {
      ...ImageFragment
    }
    priceV2 {
      ...MoneyV2Fragment
    }
    compareAtPriceV2 {
      ...MoneyV2Fragment
    }
    selectedOptions {
      value
      name
    }
    ${metafieldsToQuery(shopifyConfigProducts?.variants?.metafields)}
    requiresShipping
    sku
    title
    weight
    weightUnit
  }
`

/* Adds additional query config for each metafield supplied in the config.
 * The field names are in the format `metafield_<namespace>_<key>`, i.e.
 * metafield_filter_color */
const metafieldsToQuery = (metafields?: MetafieldConfig[]) =>
  metafields
    ? metafields.map(
        ({ namespace, key }) => `
          metafield_${namespace}_${key}: metafield(namespace: "${namespace}", key: "${key}"){
            namespace
            key
            value
          }
        `
      )
    : ''

export const createProductFragment = (
  shopifyConfigProducts?: ShopifyConfigProducts
) => gql`
  fragment ProductFragment on Product {
    __typename
    id
    updatedAt
    handle
    title
    description
    descriptionHtml
    availableForSale
    productType
    tags
    vendor
    createdAt
    publishedAt
    options {
      id
      name
      values
    }
    variants(first: 99) {
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
    ${metafieldsToQuery(shopifyConfigProducts?.metafields)}
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyV2Fragment
      }
      maxVariantPrice {
        ...MoneyV2Fragment
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
    media(first: 50) {
      edges {
        cursor
        node {
          ...MediaImageFragment
          ...VideoFragment
        }
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
  ${mediaImageFragment}
  ${imageFragment}
  ${videoFragment}
  ${createProductVariantFragment(shopifyConfigProducts)}
`

/**
 * Collection Queries
 */

export const collectionFragment = gql`
  fragment CollectionFragment on Collection {
    id
    updatedAt
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
