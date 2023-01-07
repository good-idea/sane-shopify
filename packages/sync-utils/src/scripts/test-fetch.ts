import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { createShopifyClient, shopifyUtils } from '../shopify'

dotenv.config()

const shopName = process.env.SHOPIFY_SHOP_NAME
const accessToken = process.env.SHOPIFY_STOREFRONT_TOKEN

if (!shopName || !accessToken) {
  throw new Error(
    'You must provide an .env file with a SHOPIFY_SHOP_NAME and SHOPIFY_STOREFRONT_TOKEN'
  )
}

const shopifyClient = createShopifyClient({ shopName, accessToken })
const client = shopifyUtils(shopifyClient, {
  variants: {
    metafields: [
      { namespace: 'filter', key: 'stone' },
      { namespace: 'filter', key: 'subcategory' },
      { namespace: 'filter', key: 'style' },
      { namespace: 'filter', key: 'metal' },
    ],
  },
})

const main = async () => {
  const result = await client.fetchShopifyProduct({
    handle: 'sirius-silver',
  })
  fs.writeFileSync(
    path.join(__dirname, 'test-result.json'),
    JSON.stringify(result, null, 2)
  )
}

main()
