import { Paginated } from '@good-idea/unwind-edges'
import { DocumentNode } from 'graphql'

export type Variables = { [key: string]: any }

export interface ShopifyItem {
  id: string
  updatedAt: string
  shopName: string
}

export interface Metafield {
  key: string
  namespace: string
  value: string
}

export interface WithMetaFields {
  metafields?: Paginated<Metafield>
}

export interface ShopifyClient {
  query: <ResponseType>(
    query: string | DocumentNode,
    variables?: Variables
  ) => Promise<ResponseType>
  shopName: string
}

export interface ShopifySecrets {
  shopName: string
  accessToken: string
}

export interface ShopifyImage {
  id: string
  originalSrc: string
  altText?: string
  transformedSrc?: string
  w100: string
  w300: string
  w800: string
  w1200: string
  w1600: string
  __typename: 'Image'
}

export interface ShopifyMediaImage {
  image: ShopifyImage
}

export interface ShopifyVideoSource {
  url: string
  format: string
  mimeType: string
}

export interface ShopifyVideo {
  id: string
  alt?: string
  sources: ShopifyVideoSource[]
}

export type Money = string

export interface MoneyV2 {
  amount: string
  currencyCode: string
}

export interface SelectedOption {
  name: string
  value: string
}

export interface Variant extends WithMetaFields {
  id: string
  availableForSale: boolean
  image: ShopifyImage
  price: string
  priceV2: MoneyV2
  compareAtPriceV2: MoneyV2
  title: string
  selectedOptions?: SelectedOption[]
  weight?: number
  weightUnit?: string
}

export interface ProductPriceRange {
  minVariantPrice: MoneyV2
  maxVariantPrice: MoneyV2
}

export interface Collection extends ShopifyItem, WithMetaFields {
  __typename: 'Collection'
  handle: string
  title: string
  description: string
  image?: ShopifyImage
  products: Paginated<Product>
}

export interface ProductOption {
  id: string
  name: string
  values: string[]
}

export interface Product extends ShopifyItem, WithMetaFields {
  handle: string
  title: string
  description: string
  descriptionHtml: string
  tags: string[]
  productType?: string
  compareAtPriceRange?: ProductPriceRange
  priceRange?: ProductPriceRange
  availableForSale?: boolean
  collections?: Paginated<Collection>
  options: ProductOption[]
  media: Paginated<ShopifyMediaImage | ShopifyVideo>
  images: Paginated<ShopifyImage>
  variants: Paginated<Variant>
  __typename: 'Product'
}

export interface ShopifyItemParams {
  id?: string
  handle?: string
}

export type ProgressHandler<T> = (docs: T[]) => void

export interface TestSecretsResponse {
  message: string
  isError: boolean
}

export interface ShopifyUtils {
  client: ShopifyClient
  fetchItemById: (
    id: string,
    withRelated: boolean
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
export interface SaneShopifyContext {
  shopName: string
}

/**
 * Only relevant types have been included
 *
 * See full response in the shopify docs:
 * https://shopify.dev/docs/admin-api/rest/reference/events/webhook
 */

export interface CheckoutLineItem {
  id: number
  variant_id: number
}
