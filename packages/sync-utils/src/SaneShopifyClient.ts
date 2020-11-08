import {
  ShopifyClient,
  SanityClient,
  ShopifySecrets,
  SyncMachineState,
  SyncStateMachine,
} from '@sane-shopify/types'
import { SanityUtils } from './sanity'
import { shopifyUtils, ShopifyUtils, TestSecretsResponse } from './shopify'
// import { createLogger, Logger } from './logger'
import { syncStateMachine } from './syncState'

const noop = () => undefined

export interface SaneShopifyClientConfig {
  sanityClient: SanityClient
  shopifyClient: ShopifyClient
  onStateChange?: (state: SyncMachineState) => void
}

export class SaneShopifyClient {
  private shopifyClient: ShopifyClient
  private sanityClient: SanityClient
  private sanityUtils: SanityUtils
  private shopifyUtils: ShopifyUtils
  private stateMachine: SyncStateMachine
  // private logger: Logger

  constructor({
    shopifyClient,
    sanityClient,
    onStateChange,
  }: SaneShopifyClientConfig) {
    this.stateMachine = syncStateMachine({
      onStateChange: onStateChange || noop,
    })
    this.shopifyClient = shopifyClient
    this.sanityClient = sanityClient
    this.shopifyUtils = shopifyUtils(shopifyClient)
    this.sanityUtils = new SanityUtils(sanityClient, this.stateMachine)
    // this.logger = createLogger({ onProgress, onError, onComplete })
  }

  /**
   * Public Methods
   */

  public async saveSecrets(secrets: ShopifySecrets): Promise<void> {
    const { isError, message } = await this.testSecrets(secrets)
    if (isError) {
      const error = isError ? new Error(message) : undefined
      this.stateMachine.onConfigError(error)
    } else {
      await this.sanityUtils.saveSecrets(secrets)
      this.stateMachine.onConfigValid()
    }
  }

  public async clearSecrets(): Promise<void> {
    await this.sanityUtils.clearSecrets()
    this.stateMachine.reset()
  }

  public async testSecrets(
    secrets: ShopifySecrets
  ): Promise<TestSecretsResponse> {
    return this.shopifyUtils.testSecrets(secrets)
  }

  public async syncProducts(): Promise<void> {
    this.stateMachine.reset()
    // 1. Fetch initial sanity catalogue to populate cache
    await this.sanityUtils.fetchAllSanityDocuments()

    // 2. Fetch all products from shopify
    const allShopifyProducts = await this.shopifyUtils.fetchAllShopifyProducts(
      // Add each page of products to the state
      this.stateMachine.onDocumentsFetched
    )

    this.stateMachine.onFetchComplete()

    this.sanityUtils.syncSanityDocuments(allShopifyProducts)
  }

  public async syncCollections(): Promise<void> {
    this.stateMachine.reset()
    // 1. Fetch initial sanity catalogue to populate cache
    await this.sanityUtils.fetchAllSanityDocuments()

    // 2. Fetch all products from shopify
    const allShopifyProducts = await this.shopifyUtils.fetchAllShopifyCollections(
      // Add each page of products to the state
      this.stateMachine.onDocumentsFetched
    )

    this.stateMachine.onFetchComplete()

    this.sanityUtils.syncSanityDocuments(allShopifyProducts)
  }

  public async syncAll(): Promise<void> {
    this.stateMachine.reset()
    // 1. Fetch initial sanity catalogue to populate cache
    await this.sanityUtils.fetchAllSanityDocuments()

    // 2. Fetch all products from shopify
    const allShopifyProducts = await this.shopifyUtils.fetchAllShopifyProducts(
      // Add each page of products to the state
      this.stateMachine.onDocumentsFetched
    )

    // 2. Fetch all products from shopify
    const allShopifyCollections = await this.shopifyUtils.fetchAllShopifyCollections(
      // Add each page of products to the state
      this.stateMachine.onDocumentsFetched
    )

    this.stateMachine.onFetchComplete()

    this.sanityUtils.syncSanityDocuments([
      ...allShopifyProducts,
      ...allShopifyCollections,
    ])
  }

  public async syncItemByID(id: string): Promise<void> {
    this.stateMachine.reset()
    const item = await this.shopifyUtils.fetchItemById(
      id,
      true,
      this.stateMachine.onDocumentsFetched
    )
    if (!item) {
      throw new Error(`Could not fetch item with id ${id}`)
    }
    this.stateMachine.onFetchComplete()
    this.sanityUtils.syncSanityDocuments([item])
  }
}
