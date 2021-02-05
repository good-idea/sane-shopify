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

type NextWebhooks = { [P in keyof Webhooks]: NextHandler }

export const createNextWebhooks = ({
  config,
  onError,
}: WebhooksConfig): NextWebhooks => {
  const webhooks = createWebhooks({ config, onError })

  const createNextWebhook = (
    webhook: WebhookHandler
  ): NextHandler<WebhookData> => async (req, res) => {
    await webhook(req.body).catch((err) => {
      if (onError) onError(err)
      res.status(500)
      res.send('error')
      return
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
  }

  return nextWebhooks
}
