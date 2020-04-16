import { SanityClient, SanityShopifyDocument } from '@sane-shopify/types'

export const createArchiveSanityDocument = (client: SanityClient) => async (
  doc: SanityShopifyDocument
): Promise<SanityShopifyDocument> => {
  await client.patch(doc._id).set({ archived: true }).commit()
  return doc
}
