import { SanityClient, SanityShopifyDocument } from '@sane-shopify/types'

export const createArchiveSanityDocument = (client: SanityClient) => async (
  doc: SanityShopifyDocument
): Promise<SanityShopifyDocument> => {
  const relationshipsKey =
    doc.sourceData.__typename === 'Collection' ? 'products' : 'collections'

  const removeRelationships = async (relatedDoc?: SanityShopifyDocument) => {
    if (!relatedDoc) return
    const type =
      relatedDoc.sourceData.__typename === 'Collection'
        ? 'products'
        : 'collections'

    const related = relatedDoc[type].find(
      (reference) => reference._ref === doc._id
    )
    if (!related) return

    const relationshipsToRemove = [`${type}[_key=="${related._key}"]`]

    await client
      .patch(relatedDoc._id)
      // @ts-ignore
      .unset(relationshipsToRemove)
      .commit()
  }
  const relationships = doc[relationshipsKey]
  if (!relationships) return doc
  await Promise.all(relationships.map((r) => removeRelationships(r)))
  try {
    await client.delete(doc._id)
  } catch (err) {
    await client
      .patch(doc._id)
      .set({ archived: true, shopifyId: null, [relationshipsKey]: [] })
      .commit()
  }
  return doc
}
