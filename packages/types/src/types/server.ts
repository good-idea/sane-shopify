import { SaneShopifyConfig } from './index'
import { CheckoutLineItem } from './shopify'

/**
 * Only relevant types have been included
 *
 * See full response in the shopify docs:
 * https://shopify.dev/docs/admin-api/rest/reference/events/webhook
 */

export interface ProductOrCollectionWebhookData {
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
}

export interface OrderWebhookData {
  id: string
  updated_at: string
  line_items: CheckoutLineItem[]
}

export type WebhookData = OrderWebhookData | ProductOrCollectionWebhookData

export type WebhookHandler<T> = (data: T) => Promise<void>

export interface Webhooks {
  onCollectionUpdate: WebhookHandler<ProductOrCollectionWebhookData>
  onCollectionDelete: WebhookHandler<ProductOrCollectionWebhookData>
  onCollectionCreate: WebhookHandler<ProductOrCollectionWebhookData>
  onProductUpdate: WebhookHandler<ProductOrCollectionWebhookData>
  onProductDelete: WebhookHandler<ProductOrCollectionWebhookData>
  onProductCreate: WebhookHandler<ProductOrCollectionWebhookData>
  onOrderCreate: WebhookHandler<OrderWebhookData>
}

export interface WebhooksConfig extends SaneShopifyConfig {
  onError?: (err: Error) => void
}
