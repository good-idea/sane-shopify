import { Handler, APIGatewayEvent } from 'aws-lambda'
import {
  WebhooksConfig,
  Webhooks,
  WebhookData,
  WebhookHandler,
} from '@sane-shopify/types'
import { createWebhooks } from '../webhooks'

export type AWSWebhooks = { [P in keyof Webhooks]: Handler }

export const createAWSWebhooks = (config: WebhooksConfig): AWSWebhooks => {
  const webhooks = createWebhooks(config)
  const { onError } = config

  try {
    const createAWSWebhook =
      (webhook: WebhookHandler<any>) => async (event: APIGatewayEvent) => {
        try {
          if (!event.body) {
            throw new Error('No body received from webhook event')
          }

          const nodeInfo: WebhookData = JSON.parse(event.body)
          await webhook(nodeInfo)

          return {
            statusCode: 200,
            body: '',
          }
        } catch (err) {
          const error =
            err instanceof Error
              ? err
              : new Error('There was an error parsing this webhook event')
          if (onError) {
            onError(error)
          }
          return {
            statusCode: 500,
            body: error.message,
          }
        }
      }

    const AWSWebhooks = {
      onCollectionCreate: createAWSWebhook(webhooks.onCollectionCreate),
      onCollectionUpdate: createAWSWebhook(webhooks.onCollectionUpdate),
      onCollectionDelete: createAWSWebhook(webhooks.onCollectionDelete),
      onProductCreate: createAWSWebhook(webhooks.onProductCreate),
      onProductUpdate: createAWSWebhook(webhooks.onProductUpdate),
      onProductDelete: createAWSWebhook(webhooks.onProductDelete),
      onOrderCreate: createAWSWebhook(webhooks.onOrderCreate),
    }

    return AWSWebhooks
  } catch (err) {
    const error =
      err instanceof Error
        ? err
        : new Error('An error occurred creating webhooks')
    if (onError) {
      onError(error)
      throw err
    } else {
      throw err
    }
  }
}
