import { unwindEdges } from '@good-idea/unwind-edges'
import { SanityClient } from '@sanity/client'
import { omit } from 'lodash'
import {
  SanityShopifyDocument,
  SanityShopifyDocumentPartial,
  SaneShopifyDocumentType,
  Product,
  Collection,
  TransactionType,
  LinkTrx,
  ShopifyItem,
  RelatedPairPartial,
  ShopifySecrets,
  PendingTransaction,
  TransactionStatus,
  ErroredTransaction,
  CompleteTransaction,
  SyncStateMachine,
} from '@sane-shopify/types'

import { SanityCache } from './SanityCache'
import { mergeExistingFields, prepareDocument, documentsMatch } from './utils'
import { definitely } from '../utils'
import { KEYS_ID, KEYS_TYPE } from '../constants'

interface CacheResults {
  cachedDocs: SanityShopifyDocument[]
  idsNotInCache: string[]
}

export class SanityUtils {
  private sanityClient: SanityClient
  private cache: SanityCache
  private stateMachine: SyncStateMachine

  constructor(sanityClient: SanityClient, stateMachine: SyncStateMachine) {
    this.sanityClient = sanityClient
    this.stateMachine = stateMachine
    this.cache = new SanityCache()
  }

  // private getTransaction(): Transaction {
  //   if (this.transaction) return this.transaction
  //   const trx = this.sanityClient.transaction()
  //   this.transaction = trx
  //   return trx
  // }

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

  private async fetchRelatedDocs(
    relatedNodes: ShopifyItem[]
  ): Promise<RelatedPairPartial[]> {
    const relatedIds = relatedNodes.map((r) => r.id)

    const cachedDocs = definitely(relatedIds.map(this.cache.getByShopifyId))
    const cachedIds = cachedDocs.map((d) => d.shopifyId)
    const idsNotInCache = relatedIds.filter((id) => !cachedIds.includes(id))

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
          }`,
          { relatedIds: idsNotInCache }
        )
      : []
    fetched.forEach((doc) => this.cache.set(doc))
    const relatedDocs = [...cachedDocs, ...fetched]

    const pairs = relatedNodes.map((shopifyNode) => ({
      shopifyNode,
      sanityDocument:
        relatedDocs.find((d) => d.shopifyId === shopifyNode.id) || null,
    }))
    return pairs
  }

  private async getRelationshipMutations(
    mutation: PendingTransaction
  ): Promise<LinkTrx[]> {
    const { shopifySource } = mutation
    const [related] =
      shopifySource.__typename === 'Product'
        ? unwindEdges(shopifySource.collections)
        : unwindEdges(shopifySource.products)
    const relatedDocs = await this.fetchRelatedDocs(related)

    // const mutations = await Promise.all(relatedDocs.map(this.))

    relatedDocs.map(([from, to]) => {
      //
    })
  }

  private async getMutation(
    shopifyItem: Collection | Product
  ): Promise<PendingTransaction> {
    const docInfo = prepareDocument(shopifyItem)
    const existingDoc = await this.getSanityDocByShopifyId(shopifyItem.id)
    const id = shopifyItem.id

    /* If the document exists and is up to date, skip */
    if (existingDoc && documentsMatch(docInfo, existingDoc)) {
      return {
        id,
        status: TransactionStatus.Pending,
        type: TransactionType.Skip,
        sanityDocument: existingDoc,
        shopifySource: shopifyItem,
      }
    }

    /* If the document does not exist, create it */
    if (!existingDoc) {
      const mutation = {
        create: docInfo,
      }
      return {
        id,
        type: TransactionType.Create,
        status: TransactionStatus.Pending,
        sanityDocument: docInfo,
        shopifySource: shopifyItem,
        mutation,
      }
    }

    /* Otherwise, update the existing doc */
    const patchData = omit(mergeExistingFields(docInfo, existingDoc), [
      'products',
      'collections',
      'productKeys',
      'collectionKeys',
    ])

    const mutation = {
      patch: {
        id: existingDoc._id,
        set: patchData,
      },
    }

    return {
      id,
      status: TransactionStatus.Pending,
      type: TransactionType.Patch,
      sanityDocument: existingDoc,
      shopifySource: shopifyItem,
      mutation,
    }
  }

  /**
   * Public Methods
   */

  public async syncSanityDocuments(
    shopifyItems: Array<Collection | Product>
  ): Promise<SyncOperation[]> {
    const operations = await Promise.all(
      shopifyItems.map((item) => this.getSyncOperation(item))
    )
    return operations
  }
}
