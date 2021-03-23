import { ShopifyIcon } from './icons/ShopifyIcon'
import { ShopifyTool } from './ShopifyTool'
export { ShopBadge } from './badges'

import { SaneShopifyPluginConfig } from '@sane-shopify/types'
import {
  createCollectionDocument,
  createProductDocument,
  createProductOption,
  createProductOptionValue,
  createProductVariant,
} from './sanityDocuments'
import { saneShopifyObjects } from './sanityObjects'

export const saneShopify = (config: SaneShopifyPluginConfig) => {
  return [
    createProductDocument(config.product),
    createProductVariant(config.productVariant),
    createProductOption(config.productOption),
    createProductOptionValue(config.productOptionValue),
    createCollectionDocument(config.collection),
    ...saneShopifyObjects,
  ]
}

export default {
  title: 'Shopify',
  name: 'shopify',
  icon: ShopifyIcon,
  component: ShopifyTool,
}
