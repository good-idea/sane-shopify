import {
  SanityShopifyDocument,
  SaneShopifyDocumentType,
} from '@sane-shopify/types'

export class SanityCache {
  idCache: Map<string, SanityShopifyDocument> = new Map()
  shopifyIdCache: Map<string, SanityShopifyDocument> = new Map()
  productHandleCache: Map<string, SanityShopifyDocument> = new Map()
  collectionHandleCache: Map<string, SanityShopifyDocument> = new Map()

  public getById(id: string): SanityShopifyDocument | undefined {
    return this.idCache.get(id)
  }

  public getByShopifyId(shopifyId: string): SanityShopifyDocument | undefined {
    return this.shopifyIdCache.get(shopifyId)
  }

  public getByHandle(
    handle: string,
    type: DocumentType
  ): SanityShopifyDocument | undefined {
    if (type === SaneShopifyDocumentType.Product) {
      return this.productHandleCache.get(handle)
    }
    if (type === SaneShopifyDocumentType.Collection) {
      return this.collectionHandleCache.get(handle)
    }
    return undefined
  }

  public set(doc?: SanityShopifyDocument): void {
    if (!doc) return
    this.idCache.set(doc._id, doc)
    this.shopifyIdCache.set(doc.shopifyId, doc)
    if (doc._type === SanityDocumentType.Product) {
      this.productHandleCache.set(doc.handle, doc)
    }
    if (doc._type === SanityDocumentType.Collection) {
      this.collectionHandleCache.set(doc.handle, doc)
    }
  }
}
