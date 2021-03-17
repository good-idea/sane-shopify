import { interpret, createMachine, assign } from 'xstate'
import {
  LinkOperation,
  SyncOperation,
  Product,
  Collection,
  SyncContext,
  SyncStates as States,
  SyncMachineState,
  SyncSchema,
  SyncEventType as E,
  SyncEvent,
  ReadyEvent,
  ErrorEvent,
  DocumentsFetchedEvent,
  DocumentsFetchedCompleteEvent,
  DocumentsSyncedEvent,
  DocumentsLinkedEvent,
} from '@sane-shopify/types'

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

const syncMachine = createMachine<SyncContext, SyncEvent>(
  {
    id: 'syncMachine',
    initial: States.INIT,
    context: initialContext,
    states: {
      [States.INIT]: {
        on: {
          [E.Valid]: {
            target: States.READY,
            actions: ['onReady'],
          },
          [E.Invalid]: {
            target: States.SETUP,
            actions: ['onSetup'],
          },
        },
      },
      [States.SETUP]: {
        on: {
          [E.Valid]: {
            target: States.READY,
            actions: ['onReady'],
          },

          [E.Invalid]: {
            target: States.SETUP,
            actions: ['onError'],
          },
        },
      },
      [States.READY]: {
        on: {
          [E.Sync]: States.SYNCING,
          [E.ClearedSecrets]: {
            target: States.SETUP,
            actions: 'reset',
          },
        },
      },
      [States.SYNCING]: {
        on: {
          [E.DocumentsFetched]: {
            internal: true,
            actions: ['onDocumentsFetched'],
          },
          [E.FetchComplete]: {
            internal: true,
            actions: ['onFetchedComplete'],
          },
          [E.DocumentsSynced]: {
            internal: true,
          },
          [E.DocumentsLinked]: {
            internal: true,
            actions: ['onDocumentLinked'],
          },
          [E.Complete]: States.COMPLETE,
          [E.Errored]: {
            target: States.SYNC_ERROR,
            actions: ['onError'],
          },
        },
      },
      [States.COMPLETE]: {
        on: {
          [E.Reset]: 'ready',
        },
      },
      [States.SYNC_ERROR]: {
        on: {
          [E.Reset]: 'ready',
        },
      },
    },
  },
  {
    actions: {
      // @ts-ignore
      onReady: assign<SyncContext>((_, event: ReadyEvent) => ({
        valid: true,
        ready: true,
        shopName: event.shopName,
        errorMessage: undefined,
        error: undefined,
      })),
      onSetup: assign<SyncContext, SyncEvent>({
        valid: false,
        ready: true,
      }),

      // @ts-ignore https://github.com/davidkpiano/xstate/issues/866
      onError: assign<SyncContext, ErrorEvent>({
        errorMessage: (_, event) => event.errorMessage,
        error: (_, event) => event.error,
        valid: false,
      }),

      // @ts-ignore https://github.com/davidkpiano/xstate/issues/866
      fetchedDocuments: assign<SyncContext, DocumentsFetchedEvent>({
        documentsFetched: (context, action) => [
          ...context.documentsFetched,
          ...action.shopifyDocuments,
        ],
      }),

      // @ts-ignore https://github.com/davidkpiano/xstate/issues/866
      onFetchedComplete: assign<SyncContext, DocumentsFetchedCompleteEvent>({
        toSync: (context) => context.documentsFetched,
        toLink: (context) => context.documentsFetched,
      }),

      // @ts-ignore https://github.com/davidkpiano/xstate/issues/866
      onDocumentsSynced: assign<SyncContext, DocumentsSyncedEvent>({
        syncOperations: (context, action) => [
          ...context.syncOperations,
          action.op,
        ],
      }),

      // @ts-ignore https://github.com/davidkpiano/xstate/issues/866
      onDocumentLinked: assign<SyncContext, DocumentsLinkedEvent>({
        linkOperations: (context, action) => [
          ...context.linkOperations,
          action.op,
        ],
      }),
    },
  }
)

interface SyncStateMachineArgs {
  onStateChange: (state: SyncMachineState) => void
}

interface SyncStateMachineValues {
  initialState: SyncMachineState
  init: (valid: boolean, shopName: string) => void
  startSync: () => void
  onDocumentsFetched: (docs: Array<Product | Collection>) => void
  onFetchComplete: (docs?: Array<Product | Collection>) => void
  onDocumentSynced: (op: SyncOperation) => void
  onDocumentLinked: (op: LinkOperation) => void
  onComplete: () => void
  onError: (error: Error) => void
  onSavedSecrets: (shopName: string) => void
  onSavedSecretsError: (error: Error, message?: string) => void
  onClearedSecrets: () => void
}

export const syncStateMachine = ({
  onStateChange,
}: SyncStateMachineArgs): SyncStateMachineValues => {
  const { initialState } = syncMachine
  const service = interpret<SyncContext, SyncSchema, SyncEvent>(syncMachine)
  service.start()

  service.onTransition((newState) => {
    onStateChange(newState)
  })

  const init = (valid: boolean, shopName: string) => {
    if (valid) {
      service.send({ type: E.Valid, shopName })
    } else {
      service.send(E.Invalid)
    }
  }

  const onSavedSecrets = (shopName: string) => {
    service.send({ type: E.Valid, shopName })
  }

  const onSavedSecretsError = (error: Error, message?: string) => {
    const errorMessage = message || error.message
    service.send({
      type: E.Errored,
      error,
      errorMessage,
    })
  }

  const onClearedSecrets = () => {
    service.send({ type: E.ClearedSecrets })
  }

  const startSync = () => {
    service.send(E.Sync)
  }

  const onDocumentsFetched = (
    shopifyDocuments: Array<Product | Collection>
  ) => {
    service.send({
      type: E.DocumentsFetched,
      shopifyDocuments,
    })
  }

  const onFetchComplete = (shopifyDocuments?: Array<Product | Collection>) => {
    service.send({
      type: E.FetchComplete,
      shopifyDocuments,
    })
  }

  const onDocumentSynced = (op: SyncOperation) => {
    service.send({
      type: E.DocumentsSynced,
      op,
    })
  }

  const onDocumentLinked = (op: LinkOperation) => {
    service.send({
      type: E.DocumentsLinked,
      op,
    })
  }

  const onComplete = () => {
    service.send({
      type: E.Complete,
    })
  }

  const onError = (error: Error) => {
    service.send({
      type: E.Errored,
      errorMessage: error.message,
      error,
    })
  }

  return {
    // @ts-ignore
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
