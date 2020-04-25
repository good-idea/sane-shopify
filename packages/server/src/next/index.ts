import { NextApiRequest, NextApiResponse } from 'next'
import { WebhooksConfig, Webhooks, WebhookHandler } from '@sane-shopify/types'
import { createWebhooks } from '../webhooks'

type NextHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>

type NextWebhooks = { [P in keyof Webhooks]: NextHandler }

export const createNextWebhooks = ({
  config,
  onError,
}: WebhooksConfig): NextWebhooks => {
  const webhooks = createWebhooks({ config, onError })

  const createNextWebhook = (webhook: WebhookHandler): NextHandler => async (
    req,
    res
  ) => {
    const id = req.body?.id
    await webhook({ id }).catch((err) => {
      if (onError) onError(err)
      res.status(500)
      res.send('success')
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
