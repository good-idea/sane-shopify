import { SaneShopifyConfig } from './index'

export interface WebhookData {
  id: string
  title: string
  body_html: string | null
  handle: string
  updated_at: string
  published_at: string
  status: string
  published_scope: string
  tags: string
  admin_graphql_api_id: string

  // The response also includes:
  //
  // variants
  // options
  // images
  // image
  //
  // but we don't need them here so they have been left untyped
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

export interface WebhooksConfig extends SaneShopifyConfig {
  onError?: (err: Error) => void
}
