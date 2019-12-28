import { SanityClient, SanityUtils } from '@sane-shopify/types'
import { createSyncSanityDocument } from './syncSanityDocument'

export const sanityUtils = (client: SanityClient): SanityUtils => {
  const syncSanityDocument = createSyncSanityDocument(client)

  return {
    syncSanityDocument
  }
}
