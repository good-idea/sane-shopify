import { NextApiRequest, NextApiResponse } from 'next'
import {
  WebhooksConfig,
  Webhooks,
  WebhookData,
  WebhookHandler,
} from '@sane-shopify/types'
import { createWebhooks } from '../webhooks'

export interface TypedNextApiRequest<Body = any> extends NextApiRequest {
  body: Body
}

type NextHandler<Body = any> = (
  req: TypedNextApiRequest<Body>,
  res: NextApiResponse
) => Promise<void>

export type NextWebhooks = { [P in keyof Webhooks]: NextHandler }

export const createNextWebhooks = (config: WebhooksConfig): NextWebhooks => {
  const { onError } = config

  try {
    const webhooks = createWebhooks(config)
    const createNextWebhook =
      (webhook: WebhookHandler<any>): NextHandler<WebhookData> =>
      async (req, res) => {
        await webhook(req.body).catch((err) => {
          if (onError) {
            onError(err)
          } else {
            console.error(err)
          }
          res.status(500)
          res.send('error')
          throw new Error(err.message)
        })
        res.status(200)
        res.send('success')
      }

    const nextWebhooks = {
      onCollectionCreate: createNextWebhook(webhooks.onCollectionCreate),
      onCollectionUpdate: createNextWebhook(webhooks.onCollectionUpdate),
      onCollectionDelete: createNextWebhook(webhooks.onCollectionDelete),
      onProductCreate: createNextWebhook(webhooks.onProductCreate),
      onProductUpdate: createNextWebhook(webhooks.onProductUpdate),
      onProductDelete: createNextWebhook(webhooks.onProductDelete),
      onOrderCreate: createNextWebhook(webhooks.onOrderCreate),
    }

    return nextWebhooks
  } catch (err) {
    if (onError) {
      onError(err)
      throw err
    } else {
      throw err
    }
  }
}
