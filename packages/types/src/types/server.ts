import { SaneShopifyConfig } from './index'

export interface WebhookData {
  id: string
}

export type WebhookHandler = (data: WebhookData) => Promise<void>

export interface Webhooks {
  onCollectionUpdate: WebhookHandler
  onCollectionDelete: WebhookHandler
  onCollectionCreate: WebhookHandler
  onProductUpdate: WebhookHandler
  onProductDelete: WebhookHandler
  onProductCreate: WebhookHandler
}

export interface WebhooksConfig {
  config: SaneShopifyConfig
  onError?: (err: Error) => void
}
