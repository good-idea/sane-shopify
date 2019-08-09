import { SanityClientConfig } from './sanity'
import { ShopifyClientConfig } from './shopify'

export interface SaneShopifyConfig {
  sanity: SanityClientConfig
  shopify: ShopifyClientConfig
}
