import { Paginated } from '@good-idea/unwind-edges'

export interface ShopifyClientConfig {
  shopName: string
  accessToken: string
}

export type Variables = { [key: string]: any }

export interface ShopifyItem {
  id: string
}

export interface ShopifyClient {
  query: <ResponseType>(
    query: string,
    variables?: Variables
  ) => Promise<ResponseType>
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

export interface ProductOption {
  id: string
  name: string
  values: string[]
}

export interface Product extends ShopifyItem {
  handle: string
  title: string
  description: string
  descriptionHtml: string
  tags: string[]
  productType?: string
  priceRange?: ProductPriceRange
  availableForSale?: boolean
  collections?: Paginated<Collection>
  options: ProductOption[]
  images: Paginated<ShopifyImage>
  variants: Paginated<Variant>
  __typename: 'Product'
}

export interface ShopifyItemParams {
  id?: string
  handle?: string
}

export type ProgressHandler<T> = (docs: T[]) => void

export interface ShopifyUtils {
  client: ShopifyClient
  fetchItemById: (id: string) => Promise<Product | Collection>
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
}
