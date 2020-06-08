import { Machine, assign } from 'xstate'
import {
  LinkOperation,
  SyncOperation,
  Product,
  Collection,
  SyncContext,
  SyncState,
} from '@sane-shopify/types'

/** Actions */
const READY = 'READY'
const SAVED_SECRETS = 'SAVED_SECRETS'
const DOCUMENTS_FETCHED = 'DOCUMENTS_FETCHED'

interface ReadyAction {
  type: typeof READY
  shopName: string
}

interface SavedSecretsAction {
  type: typeof SAVED_SECRETS
  shopName: string
}

interface DocumentsFetchedAction {
  type: typeof DOCUMENTS_FETCHED
  shopifyDocuments: Array<Product | Collection>
}

const FETCHED_COMPLETE = 'FETCHED_COMPLETE'

interface DocumentsFetchedCompleteAction {
  type: typeof FETCHED_COMPLETE
  shopifyDocuments: Array<Product | Collection>
}

const DOCUMENTS_SYNCED = 'DOCUMENTS_SYNCED'

interface DocumentsSyncedAction {
  type: typeof DOCUMENTS_SYNCED
  op: SyncOperation
}

const DOCUMENTS_LINKED = 'DOCUMENTS_LINKED'

interface DocumentsLinkedAction {
  type: typeof DOCUMENTS_LINKED
  op: LinkOperation
}

const ERRORED = 'ERRORED'

interface ErrorAction {
  type: typeof ERRORED
  errorMessage: string
  error: Error
}

const initialContext = {
  documentsFetched: [],
  toSync: [],
  syncOperations: [],
  toLink: [],
  linkOperations: [],
  error: undefined,
  errorMessage: undefined,
  valid: false,
  ready: false,
  shopName: undefined,
}

const syncMachine = Machine<SyncContext>({
  id: 'syncMachine',
  initial: 'init',
  context: initialContext,
  states: {
    init: {
      on: {
        VALID: {
          target: 'ready',
          actions: assign<SyncContext, ReadyAction>({
            ...initialContext,
            valid: true,
            ready: true,
            shopName: (context, action) => action.shopName,
          }),
        },
        INVALID: {
          target: 'setup',
          actions: assign<SyncContext>({
            valid: () => false,
            ready: () => true,
          }),
        },
      },
    },
    setup: {
      on: {
        VALID: {
          target: 'ready',
          actions: assign<SyncContext, SavedSecretsAction>({
            shopName: (context, action) => action.shopName,
            errorMessage: undefined,
            error: undefined,
            valid: true,
          }),
        },

        INVALID: {
          target: 'setup',
          actions: assign<SyncContext, ErrorAction>({
            errorMessage: (context, action) => action.errorMessage,
            error: (context, action) => action.error,
            valid: false,
          }),
        },
      },
    },
    ready: {
      on: {
        SYNC: 'syncing',
        CLEARED_SECRETS: {
          target: 'setup',
          actions: assign<SyncContext>({
            shopName: () => undefined,
            valid: false,
          }),
        },
      },
    },
    syncing: {
      on: {
        FETCHED_DOCUMENTS: {
          internal: true,
          actions: assign<SyncContext, DocumentsFetchedAction>({
            documentsFetched: (context, action) => {
              return [...context.documentsFetched, ...action.shopifyDocuments]
            },
          }),
        },
        FETCHED_COMPLETE: {
          internal: true,
          actions: assign<SyncContext, DocumentsFetchedCompleteAction>({
            toSync: (context) => context.documentsFetched,
            toLink: (context) => context.documentsFetched,
          }),
        },
        SYNCED_DOCUMENT: {
          internal: true,
          actions: assign<SyncContext, DocumentsSyncedAction>({
            syncOperations: (context, action) => [
              ...context.syncOperations,
              action.op,
            ],
          }),
        },
        LINKED_DOCUMENT: {
          internal: true,
          actions: assign<SyncContext, DocumentsLinkedAction>({
            linkOperations: (context, action) => {
              return [...context.linkOperations, action.op]
            },
          }),
        },
        COMPLETE: 'complete',
        ERRORED: {
          target: 'syncError',
          actions: assign<SyncContext, ErrorAction>({
            errorMessage: (context, action) => action.errorMessage,
            error: (context, action) => action.error,
          }),
        },
      },
    },
    complete: {
      on: {
        RESET: 'ready',
      },
    },
    syncError: {
      on: {
        RESET: 'ready',
      },
    },
  },
})

interface SyncStateMachineArgs {
  onStateChange: (state: SyncState) => void
}

interface SyncStateMachineValues {
  initialState: SyncState
  init: (valid: boolean, shopName?: string) => void
  startSync: () => void
  onDocumentsFetched: (docs: Array<Product | Collection>) => void
  onFetchComplete: () => void
  onDocumentSynced: (op: SyncOperation) => void
  onDocumentLinked: (op: LinkOperation) => void
  onComplete: () => void
  onError: (error: Error) => void
  onSavedSecrets: (shopName: string) => void
  onSavedSecretsError: (message: string) => void
  onClearedSecrets: () => void
}

export const syncStateMachine = ({
  onStateChange,
}: SyncStateMachineArgs): SyncStateMachineValues => {
  const { initialState } = syncMachine
  let state = initialState

  const init = (valid: boolean, shopName?: string) => {
    if (valid) {
      state = syncMachine.transition(state, { type: 'VALID', shopName })
      onStateChange(state)
    } else {
      state = syncMachine.transition(state, 'INVALID')
      onStateChange(state)
    }
  }

  const onSavedSecrets = (shopName: string) => {
    state = syncMachine.transition(state, { type: 'VALID', shopName })
    onStateChange(state)
  }

  const onSavedSecretsError = (errorMessage: string) => {
    state = syncMachine.transition(state, { type: 'INVALID', errorMessage })
    onStateChange(state)
  }

  const onClearedSecrets = () => {
    state = syncMachine.transition(state, { type: 'CLEARED_SECRETS' })
    onStateChange(state)
  }

  const startSync = () => {
    state = syncMachine.transition(state, 'SYNC')
    onStateChange(state)
  }

  const onDocumentsFetched = (
    shopifyDocuments: Array<Product | Collection>
  ) => {
    state = syncMachine.transition(state, {
      type: 'FETCHED_DOCUMENTS',
      shopifyDocuments,
    })
    onStateChange(state)
  }

  const onFetchComplete = () => {
    state = syncMachine.transition(state, {
      type: 'FETCHED_COMPLETE',
    })
  }

  const onDocumentSynced = (op: SyncOperation) => {
    state = syncMachine.transition(state, {
      type: 'SYNCED_DOCUMENT',
      op,
    })
    onStateChange(state)
  }

  const onDocumentLinked = (op: LinkOperation) => {
    state = syncMachine.transition(state, {
      type: 'LINKED_DOCUMENT',
      op,
    })
    onStateChange(state)
  }

  const onComplete = () => {
    state = syncMachine.transition(state, {
      type: 'COMPLETE',
    })
    onStateChange(state)
  }

  const onError = (error: Error) => {
    state = syncMachine.transition(state, {
      type: 'ERROR',
      errorMessage: error.message,
      error,
    })
  }

  return {
    initialState,
    startSync,
    init,
    onSavedSecrets,
    onSavedSecretsError,
    onClearedSecrets,
    onDocumentsFetched,
    onFetchComplete,
    onDocumentSynced,
    onDocumentLinked,
    onComplete,
    onError,
  }
}
