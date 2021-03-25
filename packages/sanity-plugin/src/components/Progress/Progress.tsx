import * as React from 'react'
import { Card, Text } from '@sanity/ui'
import { Product, Collection } from '@sane-shopify/types'
import { useSaneContext } from '../../Provider'

import { StatusBar } from './StatusBar'

const isProduct = (i: Product | Collection): boolean =>
  i.__typename === 'Product'
const isCollection = (i: Product | Collection): boolean =>
  i.__typename === 'Collection'

export const Progress = () => {
  const { syncState } = useSaneContext()
  const { value, context } = syncState
  const {
    toSync,
    toLink,
    documentsFetched,
    linkOperations,
    syncOperations,
  } = context

  // @ts-ignore
  if (value !== 'COMPLETE' && value !== 'SYNCING') return null

  const productsFetched = documentsFetched.filter(isProduct)
  const productsToSync = toSync.filter(isProduct)
  const productsToLink = toLink.filter(isProduct)
  const productsSynced = syncOperations
    .map((s) => s.shopifySource)
    .filter(isProduct)
  const productsLinked = linkOperations.filter(
    (s) => s.sourceDoc._type === 'shopifyProduct'
  )
  const productsFetchingStatus = `Fetched ${productsFetched.length} product${
    productsFetched.length === 1 ? '' : 's'
  }`

  const collectionsFetched = documentsFetched.filter(isCollection)
  const collectionsToSync = toSync.filter(isCollection)
  const collectionsToLink = toLink.filter(isCollection)

  const collectionsSynced = syncOperations
    .map((s) => s.shopifySource)
    .filter(isCollection)
  const collectionsLinked = linkOperations.filter(
    (s) => s.sourceDoc._type === 'shopifyCollection'
  )

  const collectionsFetchingStatus = `Fetched ${
    collectionsFetched.length
  } collection${collectionsFetched.length === 1 ? '' : 's'}`

  return (
    <>
      {documentsFetched.length === 0 ? (
        <Text size={1}>Fetching product data...</Text>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '200px 200px',
          }}
        >
          {productsFetched && productsFetched.length ? (
            <div>
              <StatusBar text={productsFetchingStatus} />
              <StatusBar
                text="Syncing products"
                complete={productsSynced.length}
                total={productsToSync.length}
              />
              <StatusBar
                text="Linking related collections"
                complete={productsLinked.length}
                total={productsToLink.length}
              />
            </div>
          ) : null}
          {collectionsFetched && collectionsFetched.length ? (
            <div>
              <StatusBar text={collectionsFetchingStatus} />
              <StatusBar
                text="Syncing collections"
                complete={collectionsSynced.length}
                total={collectionsToSync.length}
              />
              <StatusBar
                text="Linking related products"
                complete={collectionsLinked.length}
                total={collectionsToLink.length}
              />
            </div>
          ) : null}
        </div>
      )}
      <Card
        marginTop={[2, 3, 4]}>
        {value === 'COMPLETE' ? (
          <Text size={1}>
            Syncing complete! 🎉
          </Text>
        ) : (
          <Text size={1}>
            This may take a few minutes. Do not navigate away from this tab until
            syncing is complete.
          </Text>
        )}
      </Card>
    </>
  )
}
