import { Paginated } from './graphql'

type Variables = object

export interface ShopifyItem {
  id: string
}

export interface ShopifyClient {
  query: <ResponseType>(query: string, variables?: Variables) => Promise<ResponseType>
}

export interface ShopifySecrets {
  storefrontName: string
  storefrontApiKey: string
}

export interface ShopifyImage {
  id: string
  originalSrc: string
  altText?: string
  transformedSrc?: string
  __typename: 'Image'
}

export type Money = string

export interface SelectedOption {
  name: string
  value: string
}

export interface Variant {
  id: string
  availableForSale: boolean
  image: ShopifyImage
  price: string
  title: string
  selectedOptions?: SelectedOption[]
  weight?: number
  weightUnit?: string
}

export interface ProductPriceRange {
  minVariantPrice: Money
  maxVariantPrice: Money
}

export interface Collection extends ShopifyItem {
  __typename: 'Collection'
  handle: string
  title: string
  description: string
  image?: ShopifyImage
  products: Paginated<Product>
}

export interface Product extends ShopifyItem {
  handle: string
  title: string
  description: string
  productType?: string
  priceRange?: ProductPriceRange
  availableForSale?: boolean
  collections?: Collection[]
  images: Paginated<ShopifyImage>
  variants: Paginated<Variant>
  __typename: 'Product'
  /* Extended by Sanity */
}
