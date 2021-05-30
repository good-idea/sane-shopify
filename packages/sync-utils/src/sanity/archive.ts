import { SanityClient } from '@sanity/client'
import { SanityShopifyDocument } from '@sane-shopify/types'
import { isSanityProduct, isSanityCollection } from '../typeGuards'

const getRelationshipsToRemove = (
  sourceDoc: SanityShopifyDocument,
  relatedDoc: SanityShopifyDocument
) => {
  if (isSanityProduct(relatedDoc)) {
    const related = relatedDoc.collections.find(
      (reference) => reference._ref === sourceDoc._id
    )
    if (!related) return
    const relationshipsToRemove = [`collections[_key=="${related._key}"]`]
    return relationshipsToRemove
  } else if (isSanityCollection(relatedDoc)) {
    const related = relatedDoc.products.find(
      (reference) => reference._ref === sourceDoc._id
    )
    if (!related) return
    const relationshipsToRemove = [`products[_key=="${related._key}"]`]
    return relationshipsToRemove
  }
  throw new Error('Could not get relationships for this document')
}

export const createArchiveSanityDocument =
  (client: SanityClient) =>
  async (doc: SanityShopifyDocument): Promise<SanityShopifyDocument> => {
    const relationshipsKey =
      doc.sourceData.__typename === 'Collection' ? 'products' : 'collections'

    const removeRelationships = async (relatedDoc: SanityShopifyDocument) => {
      const relationshipsToRemove = getRelationshipsToRemove(doc, relatedDoc)
      if (!relationshipsToRemove) return
      await client.patch(relatedDoc._id).unset(relationshipsToRemove).commit()
    }

    const relationships = isSanityProduct(doc)
      ? doc.collections
      : isSanityCollection(doc)
      ? doc.products
      : undefined

    if (relationships) {
      // @ts-ignore
      await Promise.all(relationships.map((r) => removeRelationships(r)))
    }
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
