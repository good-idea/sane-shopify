import {
  Operation,
  ShopifyClient,
  SanityClient,
  SaneShopifyClientConfig,
  ShopifySecrets,
  SubscriptionCallbacks,
  TestSecretsResponse,
  ShopifyUtils,
} from '@sane-shopify/types'
import { SanityUtils } from './sanity'
import { shopifyUtils } from './shopify'
import { syncStateMachine, SyncStateMachine } from './syncState'

const noop = () => undefined

export class SaneShopifyClient {
  private operations: Operation[] = []
  private shopifyClient: ShopifyClient
  private sanityClient: SanityClient
  private sanityUtils: SanityUtils
  private shopifyUtils: ShopifyUtils
  private stateMachine: SyncStateMachine

  constructor({
    shopifyClient,
    sanityClient,
    onStateChange,
  }: SaneShopifyClientConfig) {
    this.shopifyClient = shopifyClient
    this.sanityClient = sanityClient
    this.shopifyUtils = shopifyUtils(shopifyClient)
    this.sanityUtils = new SanityUtils(sanityClient)
    this.stateMachine = syncStateMachine({
      onStateChange: onStateChange || noop,
    })
  }

  /**
   * Public Methods
   */

  public async saveSecrets(secrets: ShopifySecrets): Promise<void> {
    const { isError, message } = await this.shopifyUtils.testSecrets(secrets)
    if (isError) throw new Error(message)
    await this.sanityUtils.saveSecrets(secrets)
    this.stateMachine.onSavedSecrets(secrets.shopName)
  }

  public async clearSecrets(): Promise<void> {
    await this.sanityUtils.clearSecrets()
    this.stateMachine.onClearedSecrets()
  }

  public async testSecrets(
    secrets: ShopifySecrets
  ): Promise<TestSecretsResponse> {
    return this.shopifyUtils.testSecrets(secrets)
  }

  public async syncProducts(cbs?: SubscriptionCallbacks): Promise<void> {
    // 1. Fetch initial sanity catalogue to populate cache
    await this.sanityUtils.fetchAllSanityDocuments()

    // 2. Fetch all products from shopify
    const allShopifyProducts = await this.shopifyUtils.fetchAllShopifyProducts(
      // Add each page of products to the state
      this.stateMachine.onDocumentsFetched
    )

    this.stateMachine.onFetchComplete()

    // 3. Compare documents and sort into skip / patch / create
    const operations = this.sanityUtils.syncSanityDocuments(
      allShopifyProducts,
      this.stateMachine.onDocumentSynced
    )

    // 4. Archive products that no longer exist
  }

  public async syncCollections(cbs?: SubscriptionCallbacks): Promise<void> {}

  public async syncAll(cbs?: SubscriptionCallbacks): Promise<void> {}

  public async syncItemByID(cbs?: SubscriptionCallbacks): Promise<void> {}
}
