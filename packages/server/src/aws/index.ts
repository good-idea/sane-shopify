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
    const createAWSWebhook = (webhook: WebhookHandler) => async (
      event: APIGatewayEvent
    ) => {
      if (!event.body) {
        if (onError) {
          onError(new Error('No body received from webhook event'))
          return
        } else {
          throw new Error('No body received from webhook event')
        }
      }
      const nodeInfo: WebhookData = JSON.parse(event.body)
      await webhook(nodeInfo)
    }

    const AWSWebhooks = {
      onCollectionCreate: createAWSWebhook(webhooks.onCollectionCreate),
      onCollectionUpdate: createAWSWebhook(webhooks.onCollectionUpdate),
      onCollectionDelete: createAWSWebhook(webhooks.onCollectionDelete),
      onProductCreate: createAWSWebhook(webhooks.onProductCreate),
      onProductUpdate: createAWSWebhook(webhooks.onProductUpdate),
      onProductDelete: createAWSWebhook(webhooks.onProductDelete),
    }

    return AWSWebhooks
  } catch (err) {
    if (onError) {
      onError(err)
      throw err
    } else {
      throw err
    }
  }
}
