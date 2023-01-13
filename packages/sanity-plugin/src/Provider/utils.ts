import { definitely } from '@sane-shopify/sync-utils'
import {
  Keyed,
  SaneShopifyConfigDocument,
  MetafieldConfig,
  MetafieldConfigType,
} from '@sane-shopify/types'

export const getMetafieldsConfigByType = (
  type: MetafieldConfigType,
  config: SaneShopifyConfigDocument
): Keyed<MetafieldConfig>[] => {
  return definitely(config?.[type]?.metafields)
}
