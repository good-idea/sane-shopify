import { SanityClient, Transaction } from '@sanity/client'
import { omit } from 'lodash'
import {
  SanityShopifyDocument,
  SanityShopifyDocumentPartial,
  SaneShopifyDocumentType,
  Product,
  Collection,
  SyncOperation,
  SyncType,
  ShopifyItem,
  RelatedPairPartial,
  ShopifySecrets,
} from '@sane-shopify/types'
import { SanityCache } from './SanityCache'
import { mergeExistingFields, prepareDocument, documentsMatch } from './utils'
import { KEYS_ID, KEYS_TYPE } from '../constants'

interface CacheResults {
  cachedDocs: SanityShopifyDocument[]
  idsNotInCache: string[]
}

export class SanityUtils {
  private sanityClient: SanityClient
  private cache: SanityCache
  private transaction: Transaction | null = null

  constructor(sanityClient: SanityClient) {
    this.sanityClient = sanityClient
    this.cache = new SanityCache()
  }

  private getTransaction(): Transaction {
    if (this.transaction) return this.transaction
    const trx = this.sanityClient.transaction()
    this.transaction = trx
    return trx
  }

  private async getSanityDocByShopifyId(
    shopifyId: string
  ): Promise<SanityShopifyDocument | void> {
    const cached = this.cache.getByShopifyId(shopifyId)
    if (cached) return cached
    const doc = await this.sanityClient.fetch<SanityShopifyDocument>(
      `
      *[shopifyId == $shopifyId]{
        products[]->,
        collections[]->,
        "collectionKeys": collections[]{
          ...
        },
        "productKeys": products[]{
          ...
        },
        ...
      }[0]`,
      {
        shopifyId,
      }
    )
    if (doc) this.cache.set(doc)
    return doc
  }

  public async saveSecrets(secrets: ShopifySecrets): Promise<void> {
    const doc = {
      _id: KEYS_ID,
      _type: KEYS_TYPE,
      ...secrets,
    }
    await this.sanityClient.createIfNotExists(doc)
    await this.sanityClient
      .patch(KEYS_ID)
      .set({ ...secrets })
      .commit()
  }

  public async clearSecrets(): Promise<void> {
    await this.sanityClient
      .patch(KEYS_ID)
      .set({
        shopName: '',
        accessToken: '',
      })
      .commit()
  }

  public async fetchAllSanityDocuments(
    type?: SaneShopifyDocumentType
  ): Promise<SanityShopifyDocument[]> {
    const filter = type
      ? `_type == '${type}'`
      : `_type == ${SaneShopifyDocumentType.Product} || _type == ${SaneShopifyDocumentType.Collection}`

    const allDocs = await this.sanityClient.fetch<SanityShopifyDocument[]>(`
      *[
        shopifyId != null &&
        (${filter})
       ]{
          collections[]->,
          products[]->,
          "collectionKeys": collections[]{
            ...
          },
          "productKeys": products[]{
            ...
          },
         ...,
        }
      `)
    allDocs.forEach(this.cache.set)
    return allDocs
  }

  private async getSyncOperation(
    shopifyItem: Collection | Product
  ): Promise<SyncOperation> {
    const docInfo = prepareDocument(shopifyItem)
    const existingDoc = await this.getSanityDocByShopifyId(shopifyItem.id)
    const trx = this.getTransaction()

    /* If the document exists and is up to date, skip */
    if (existingDoc && documentsMatch(docInfo, existingDoc)) {
      return {
        type: SyncType.Skip,
        sanityDocument: existingDoc,
        shopifySource: shopifyItem,
      }
    }

    /* If the document does not exist, create it */
    if (!existingDoc) {
      trx.create<SanityShopifyDocumentPartial>(docInfo)
      return {
        type: SyncType.Create,
        sanityDocument: docInfo,
        shopifySource: shopifyItem,
      }
    }

    /* Otherwise, update the existing doc */

    const patchData = omit(mergeExistingFields(docInfo, existingDoc), [
      'products',
      'collections',
      'productKeys',
      'collectionKeys',
    ])

    trx.patch(existingDoc._id, (p) => p.set(patchData))
    return {
      type: SyncType.Update,
      sanityDocument: docInfo,
      shopifySource: shopifyItem,
    }
  }

  /**
   * Public Methods
   */
  public async syncSanityDocument(
    shopifyItem: Collection | Product
  ): Promise<SyncOperation> {
    this.getTransaction()
    const operation = await this.getSyncOperation(shopifyItem)
    this.getTransaction().commit()
    return operation
  }

  public async syncSanityDocuments(
    shopifyItems: Array<Collection | Product>
  ): Promise<SyncOperation[]> {
    this.getTransaction()
    const operations = await Promise.all(
      shopifyItems.map((item) => this.getSyncOperation(item))
    )
    this.getTransaction().commit()
    return operations
  }

  public async fetchRelatedDocs(
    relatedNodes: ShopifyItem[]
  ): Promise<RelatedPairPartial[]> {
    const relatedIds = relatedNodes.map((r) => r.id)
    const { cachedDocs, idsNotInCache } = relatedIds
      .map((id) => ({
        cachedItem: this.cache.getByShopifyId(id),
        id,
      }))
      .reduce<CacheResults>(
        (acc, current) => {
          if (current.cachedItem === undefined) {
            return {
              ...acc,
              idsNotInCache: [...acc.idsNotInCache, current.id],
            }
          }
          return {
            ...acc,
            cachedDocs: [...acc.cachedDocs, current.cachedItem],
          }
        },
        { cachedDocs: [], idsNotInCache: [] }
      )

    const fetched = idsNotInCache.length
      ? await this.sanityClient.fetch<SanityShopifyDocument[]>(
          `
          *[shopifyId in $relatedIds && defined(archived) && archived != true]{
            products[]->,
            collections[]->,
            "collectionKeys": collections[]{
              ...
            },
            "productKeys": products[]{
              ...
            },
            ...,
          }
        `,
          { relatedIds: idsNotInCache }
        )
      : []
    fetched.forEach(this.cache.set)
    const relatedDocs = [...cachedDocs, ...fetched]
    const pairs = relatedNodes.map((shopifyNode) => ({
      shopifyNode,
      sanityDocument:
        relatedDocs.find((d) => d.shopifyId === shopifyNode.id) || null,
    }))
    return pairs
  }
}
