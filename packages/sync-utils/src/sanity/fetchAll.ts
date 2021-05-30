import { SanityClient } from '@sanity/client'
import { SanityShopifyDocument, SanityFetchParams } from '@sane-shopify/types'
import { SanityCache } from './sanityUtils'

const defaultParams = {
  types: ['shopifyCollection', 'shopifyProduct'],
}

export const createFetchAll =
  (client: SanityClient, cache: SanityCache) =>
  async (params?: SanityFetchParams): Promise<SanityShopifyDocument[]> => {
    // const p = params ?? defaultParams
    // const types = p.types ?? defaultParams.types
    const types = params && params.types ? params.types : defaultParams.types
    const typesFilter = types.map((type) => `_type == '${type}'`).join(' || ')

    const allDocs = await client.fetch<SanityShopifyDocument[]>(`
  *[
    shopifyId != null &&
    !(_id in path('drafts.**')) &&
    (${typesFilter})
   ]{
      products[]->{
        "collectionRefs": collections[],
        ...
      },
      collections[]->{
        "productRefs": products[],
        ...
      },
      "collectionRefs": collections[],
      "productRefs": products[],
      ...
   }
  `)
    allDocs.forEach((doc) => cache.set(doc))
    return allDocs
  }
