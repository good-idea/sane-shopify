import { Handler, APIGatewayEvent } from 'aws-lambda'
import {
  WebhooksConfig,
  Webhooks,
  WebhookData,
  WebhookHandler,
} from '@six-socks-studio/sane-shopify-types'
import { createWebhooks } from '../webhooks'

export type AWSWebhooks = { [P in keyof Webhooks]: Handler }

export const createAWSWebhooks = (config: WebhooksConfig): AWSWebhooks => {
  const webhooks = createWebhooks(config)
  const { onError } = config

  try {
    const createAWSWebhook = (webhook: WebhookHandler) => async (
      event: APIGatewayEvent
    ) => {
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
      } catch (error) {
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
