import { Handler, APIGatewayEvent } from 'aws-lambda'
import { WebhooksConfig, Webhooks, WebhookHandler } from '@sane-shopify/types'
import { createWebhooks } from '../webhooks'

type AWSWebhooks = { [P in keyof Webhooks]: Handler }

export const createAWSWebhooks = ({
  config,
  onError,
}: WebhooksConfig): AWSWebhooks => {
  const webhooks = createWebhooks({ config, onError })

  const createAWSWebhook = (webhook: WebhookHandler) => async (
    event: APIGatewayEvent
  ) => {
    if (!event.body) {
      if (onError) onError(new Error('No body received from webhook event'))
      return
    }
    const nodeInfo = JSON.parse(event.body)
    const { id } = nodeInfo
    await webhook({ id })
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
}
