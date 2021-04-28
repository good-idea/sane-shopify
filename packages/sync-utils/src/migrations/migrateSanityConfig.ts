import type { SanityClient, Transaction } from '@sanity/client'
import { SaneShopifyConfigDocument } from '@sane-shopify/types'
import { CONFIG_DOC_ID_PREFIX, CONFIG_DOC_TYPE } from '../constants'
import Debug from 'debug'

const log = Debug('sane-shopify:migrations')

const KEYS_TYPE = 'sane-shopify.keys'

/**
 * Update config doc type names
 */
const updateDocumentType = async (client: SanityClient): Promise<void> => {
  const oldConfigDocs = await client.fetch<SaneShopifyConfigDocument[]>(
    `*[_type == $type]`,
    {
      type: KEYS_TYPE,
    }
  )
  const newConfigDocs = await client.fetch<SaneShopifyConfigDocument[]>(
    `*[_type == $type]`,
    {
      type: CONFIG_DOC_TYPE,
    }
  )

  if (oldConfigDocs && oldConfigDocs.length) {
    const trx = oldConfigDocs.reduce<Transaction>((prevTrx, configDoc) => {
      if (newConfigDocs.find((doc) => doc.shopName === configDoc.shopName)) {
        // If there is an updated config doc, just delete the old one and continue
        prevTrx.delete(configDoc._id)
        return prevTrx
      }
      // Updating an document _type field isn't allowed, we have to create a new and delete the old
      const newDocument = {
        ...configDoc,
        _id: CONFIG_DOC_ID_PREFIX.concat(configDoc.shopName),
        _type: CONFIG_DOC_TYPE,
      }
      prevTrx.create(newDocument).delete(configDoc._id)

      // prevTrx.patch(configDoc._id, { set: { _type: CONFIG_DOC_TYPE } })
      return prevTrx
    }, client.transaction())

    log('Updated sanity config document type')
    await trx.commit()
  }
}

const migrations = [updateDocumentType]

export const migrateSanityConfig = async (client: SanityClient) => {
  await Promise.all(migrations.map((migration) => migration(client)))
}
