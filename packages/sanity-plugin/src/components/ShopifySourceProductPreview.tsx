import * as React from 'react'
import { unwindEdges } from '@good-idea/unwind-edges'
import {
  SubscriptionCallbacks,
  Product,
  Collection,
  SanityShopifyDocument
} from '@sane-shopify/types'
const Button = require('part:@sanity/components/buttons/default').default
const Fieldset = require('part:@sanity/components/fieldsets/default').default
import { Value, StatusBar } from './shared'
import { Provider, useSaneContext } from '../provider'

const { useReducer } = React

interface ShopifySourceProductPreviewProps {
  value: Product
}

interface State {
  loading: boolean
  complete: boolean
  error?: string
  documentsFetched: Array<Product | Collection>
  toSync: number
  documentsSynced: SanityShopifyDocument[]
  toLink: number
  relationshipsSynced: SanityShopifyDocument[]
}

const initialState: State = {
  loading: false,
  complete: false,
  error: undefined,
  documentsFetched: [],
  toSync: 0,
  documentsSynced: [],
  toLink: 0,
  relationshipsSynced: []
}

const START = 'START'
const DOCUMENTS_FETCHED = 'DOCUMENTS_FETCHED'
const DOCUMENTS_SYNCED = 'DOCUMENTS_SYNCED'
const RELATIONSHIPS_SYNCED = 'RELATIONSHIPS_SYNCED'
const RESET = 'RESET'
const ERROR = 'ERROR'
const COMPLETE = 'COMPLETE'

interface StartAction {
  type: typeof START
}

interface DocumentsFetchedAction {
  type: typeof DOCUMENTS_FETCHED
  documents: Array<Product | Collection>
}

interface DocumentsSyncedAction {
  type: typeof DOCUMENTS_SYNCED
  document: SanityShopifyDocument
}

interface RelationshipsSyncedAction {
  type: typeof RELATIONSHIPS_SYNCED
  document: SanityShopifyDocument
}

interface ResetAction {
  type: typeof RESET
}

interface ErrorAction {
  type: typeof ERROR
  message: string
}
interface CompleteAction {
  type: typeof COMPLETE
}

type Action =
  | StartAction
  | DocumentsFetchedAction
  | DocumentsSyncedAction
  | RelationshipsSyncedAction
  | ResetAction
  | ErrorAction
  | CompleteAction

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case START:
      return {
        ...state,
        loading: true
      }
    case DOCUMENTS_FETCHED:
      return {
        ...state,
        documentsFetched: action.documents,
        toSync: action.documents.length,
        toLink: action.documents.length
      }
    case DOCUMENTS_SYNCED:
      return {
        ...state,
        documentsSynced: [...state.documentsSynced, action.document]
      }
    case RELATIONSHIPS_SYNCED:
      return {
        ...state,
        relationshipsSynced: [...state.relationshipsSynced, action.document]
      }
    case ERROR:
      return {
        ...state,
        loading: false,
        error: action.message
      }
    case COMPLETE: {
      return {
        ...state,
        loading: false,
        complete: true
      }
    }
    case RESET:
      return initialState
    default:
      return state
  }
}

const ShopifySourceProductPreviewInner = ({
  value
}: ShopifySourceProductPreviewProps) => {
  const { valid, ready, syncingClient } = useSaneContext()
  const [state, dispatch] = useReducer(reducer, initialState)
  const {
    loading,
    complete,
    error,
    documentsFetched,
    toSync,
    documentsSynced,
    toLink,
    relationshipsSynced
  } = state
  const syncProductByHandle =
    ready && syncingClient ? syncingClient.syncProductByHandle : () => {}
  const {
    title,
    handle,
    tags,
    productType,
    availableForSale,
    description,
    variants: paginatedVariants
  } = value
  const [variants] = unwindEdges(paginatedVariants)
  const variantsValue = `${variants.length} variant${
    variants.length === 1 ? '' : 's'
  }`

  const reSync = async () => {
    dispatch({ type: START })
    const onProgress: SubscriptionCallbacks['onProgress'] = (op) => {
      if (op.type === 'fetched') {
        dispatch({ type: DOCUMENTS_FETCHED, documents: op.shopifyDocuments })
      } else if (op.type === 'link') {
        dispatch({ type: RELATIONSHIPS_SYNCED, document: op.sourceDoc })
      } else if (/update|skip/.test(op.type)) {
        dispatch({ type: DOCUMENTS_SYNCED, document: op.sanityDocument })
      } else {
        console.error('no handler for type', op.type)
      }
    }
    const onComplete: SubscriptionCallbacks['onComplete'] = (ops, message) => {
      dispatch({ type: COMPLETE })
    }
    const onError: SubscriptionCallbacks['onError'] = (err) => {
      dispatch({ type: ERROR, message: err.message })
      console.error('error', err)
    }
    const callbacks = { onProgress, onComplete, onError }
    syncProductByHandle(handle, callbacks)
  }

  if (ready === true && valid === false)
    return (
      <p style={{ color: 'red' }}>
        Sane Shopify has not been configured, or the keys need to be updated.
        Navigate to the Shopify tab to update your configuration.
      </p>
    )

  const buttonDisabled =
    complete === true ||
    ready === false ||
    error !== undefined ||
    loading === true
  const fetchingStatus =
    (loading || complete) && documentsFetched.length
      ? `Fetched ${documentsFetched.length} product${
          documentsFetched.length === 1 ? '' : 's'
        }`
      : 'Fetching product data..'

  return (
    <Fieldset
      legend="Shopify Source Data"
      description="Read-only. Synced from product data in Shopify"
    >
      <Value label="Title" value={title} />
      {tags.length ? <Value label="Tags" value={tags.join(', ')} /> : null}
      {productType ? <Value label="Product Type" value={productType} /> : null}
      <Value label="Available" value={availableForSale ? 'Yes ✅' : 'No 🚫'} />
      <Value label="Variants" value={variantsValue} />
      <hr />
      <Value label="Description" value={description} />
      <hr />
      <Button color="primary" disabled={buttonDisabled} onClick={reSync}>
        Sync from Shopify
      </Button>
      {loading || complete ? (
        <>
          <StatusBar text={fetchingStatus} />
          <StatusBar
            text="Syncing documents"
            complete={documentsSynced.length}
            total={toSync}
          />
          <StatusBar
            text="Linking related documents"
            complete={relationshipsSynced.length}
            total={toLink}
          />
        </>
      ) : null}
      {complete ? <p>Syncing Complete! 🎉</p> : null}
      {error ? <p style={{ color: 'red' }}>{error}</p> : null}
    </Fieldset>
  )
}

export class ShopifySourceProductPreview extends React.Component<
  ShopifySourceProductPreviewProps
> {
  render() {
    return (
      <Provider>
        <ShopifySourceProductPreviewInner {...this.props} />
      </Provider>
    )
  }
}
