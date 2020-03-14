import { Machine, assign } from 'xstate'
import {
  LinkOperation,
  SyncOperation,
  Product,
  Collection,
  SanityShopifyDocument
} from '@sane-shopify/types'

interface SyncContext {
  documentsFetched: Array<Product | Collection>
  toSync: number
  syncOperations: SyncOperation[]
  toLink: number
  linkOperations: LinkOperation[]
  error: string | void
}

/** Actions */

const DOCUMENTS_FETCHED = 'DOCUMENTS_FETCHED'

interface DocumentsFetchedAction {
  type: typeof DOCUMENTS_FETCHED
  shopifyDocuments: Array<Product | Collection>
}

const FETCHED_COMPLETE = 'FETCHED_COMPLETE'

interface DocumentsFetchedCompleteAction {
  type: typeof FETCHED_COMPLETE
}

const DOCUMENTS_SYNCED = 'DOCUMENTS_SYNCED'

interface DocumentsSyncedAction {
  type: typeof DOCUMENTS_SYNCED
  ops: SyncOperation[]
}

const DOCUMENTS_LINKED = 'DOCUMENTS_LINKED'

interface DocumentsLinkedAction {
  type: typeof DOCUMENTS_LINKED
  ops: LinkOperation[]
}

const syncMachine = Machine<SyncContext>({
  id: 'syncMachine',
  initial: 'init',
  context: {
    documentsFetched: [],
    toSync: 0,
    syncOperations: [],
    toLink: 0,
    linkOperations: [],
    error: undefined
  },
  states: {
    init: {
      on: {
        VALID: 'ready',
        INVALID: 'setup'
      }
    },
    setup: {
      on: {
        SUBMIT: 'submittingSecrets'
      }
    },
    submittingSecrets: {
      on: {
        VALID: 'ready',
        INVALID: {
          target: 'setup',
          actions: assign<SyncContext>({
            error: () => 'Error Message'
          })
        }
      }
    },
    ready: {
      on: {
        SYNC: 'syncing'
      }
    },
    syncing: {
      on: {
        FETCHED_DOCUMENTS: {
          internal: true,
          actions: assign<SyncContext, DocumentsFetchedAction>({
            documentsFetched: (context, action) => [
              ...context.documentsFetched,
              ...action.shopifyDocuments
            ]
          })
        },
        FETCHED_COMPLETE: {
          internal: true,
          actions: assign<SyncContext, DocumentsFetchedCompleteAction>({
            toSync: 100,
            toLink: 100
          })
        },
        SYNCED_DOCUMENTS: {
          internal: true,
          actions: assign<SyncContext, DocumentsSyncedAction>({
            syncOperations: (context, action) => [
              ...context.syncOperations,
              ...action.ops
            ]
          })
        },
        LINKED_DOCUMENTS: {
          internal: true,
          actions: assign<SyncContext, DocumentsLinkedAction>({
            linkOperations: (context, action) => [
              ...context.linkOperations,
              ...action.ops
            ]
          })
        },

        COMPLETE: 'complete',
        ERRORED: 'syncError'
      }
    },
    complete: {},
    syncError: {}
  }
})
