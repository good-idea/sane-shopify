import { SanityClient, SanityShopifyDocument } from '@sane-shopify/types'
import { SanityCache } from './sanityUtils'

export const createFetchAll = (
  client: SanityClient,
  cache: SanityCache
) => async (): Promise<SanityShopifyDocument[]> => {
  const allDocs = await client.fetch<SanityShopifyDocument[]>(`
  *[
    shopifyId != null &&
    (_type == 'shopifyCollection' || _type == 'shopifyProduct')
   ]{
      collections[]->,
      products[]->,
      ...,
    }
  `)
  allDocs.forEach((doc) => cache.set(doc))
  return allDocs
}
