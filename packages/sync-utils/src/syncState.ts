import { Machine, interpret, assign } from 'xstate'
import {
  Product,
  Collection,
  PendingTransaction,
  CompleteTransaction,
  ErroredTransaction,
  SyncStates,
  SyncContext,
  EventType,
  Events,
  SyncSchema,
  SyncStateMachine,
  SyncStateMachineArgs,
} from '@sane-shopify/types'

const initialContext: SyncContext = {
  ready: false,
  complete: false,
  error: undefined,
  shopifyDocuments: [],
  transactionsPending: [],
  transactionsComplete: [],
  transactionsErrored: [],
}

const schema: SyncSchema = {
  id: 'syncMachine',
  initial: SyncStates.Initial,
  context: initialContext,
  states: {
    [SyncStates.Initial]: {
      on: {
        [EventType.ConfigValid]: SyncStates.Ready,
        [EventType.ConfigError]: {
          target: SyncStates.Setup,
          actions: 'setError',
        },
        [EventType.ConfigEmpty]: SyncStates.Setup,
      },
    },
    [SyncStates.Setup]: {
      on: {
        [EventType.ConfigValid]: SyncStates.Ready,
        [EventType.ConfigError]: {
          internal: true,
          actions: 'setError',
        },
      },
    },
    [SyncStates.Ready]: {
      on: {
        [EventType.Start]: SyncStates.Fetching,
      },
    },
    [SyncStates.Fetching]: {
      on: {
        [EventType.FetchComplete]: {
          target: SyncStates.PreparingTransactions,
          actions: 'saveDocuments',
        },
      },
    },
    [SyncStates.PreparingTransactions]: {
      on: {
        [EventType.TransactionsPrepared]: {
          target: SyncStates.Syncing,
          actions: 'saveTransactions',
        },
      },
    },
    [SyncStates.Syncing]: {
      on: {
        '': {
          target: SyncStates.Complete,
          cond: 'transactionComplete',
        },
        [EventType.SyncProgress]: {
          internal: true,
          actions: 'saveSyncProgress',
        },
        [EventType.SyncComplete]: {
          target: SyncStates.Complete,
          actions: 'saveTransactions',
        },
      },
    },
    [SyncStates.Complete]: {
      entry: 'setComplete',
    },
    on: {
      [EventType.Reset]: [
        {
          target: SyncStates.Ready,
          actions: 'resetSyncState',
          cond: 'configIsValid',
        },
        {
          target: SyncStates.Initial,
          actions: 'resetState',
          cond: 'configIsInvalid',
        },
      ],
    },
  },
}

const syncMachine = Machine<SyncContext, Events>(schema, {
  actions: {
    // @ts-ignore https://github.com/davidkpiano/xstate/issues/866
    setComplete: assign({ complete: true }),

    // @ts-ignore https://github.com/davidkpiano/xstate/issues/866
    resetState: assign(initialContext),

    // @ts-ignore https://github.com/davidkpiano/xstate/issues/866
    resetSyncState: assign(({ ready }) => ({
      ...initialContext,
      ready,
    })),

    // @ts-ignore https://github.com/davidkpiano/xstate/issues/866
    setError: assign<SyncContext, ConfigErrorEvent>({
      error: (ctx, action) => action.error,
    }),

    // @ts-ignore https://github.com/davidkpiano/xstate/issues/866
    setReady: assign<SyncContext>({
      ready: true,
    }),

    // @ts-ignore https://github.com/davidkpiano/xstate/issues/866
    saveDocuments: assign<SyncContext, FetchProgressEvent>({
      shopifyDocuments: (context, action) => [
        ...context.shopifyDocuments,
        ...action.shopifyDocuments,
      ],
    }),

    // @ts-ignore https://github.com/davidkpiano/xstate/issues/866
    saveTransactions: assign<SyncContext, TransactionsPreparedEvent>({
      transactionsPending: (context, action) => [
        ...context.transactionsPending,
        ...action.transactions,
      ],
    }),

    // @ts-ignore https://github.com/davidkpiano/xstate/issues/866
    saveSyncProgress: assign<SyncContext, SyncProgressEvent>(
      (context, action) => {
        const { completedTransactions, erroredTransactions } = action

        const completeIds = [
          ...completedTransactions,
          ...erroredTransactions,
        ].map((t) => t.id)
        // remove errored & completed transactions from the pending ones
        const transactionsPending = context.transactionsPending.filter(
          (t) => !completeIds.includes(t.id)
        )

        return {
          transactionsPending,
          completedTransactions,
          erroredTransactions,
        }
      }
    ),
  },
  guards: {
    transactionsComplete: ({ transactionsPending }) =>
      transactionsPending.length === 0,
    configIsValid: ({ ready }) => Boolean(ready),
    configIsInvalid: ({ ready }) => !Boolean(ready),
  },
})

export const syncStateMachine = ({
  onStateChange,
}: SyncStateMachineArgs): SyncStateMachine => {
  const { initialState } = syncMachine
  const service = interpret<SyncContext, SyncSchema, Events>(syncMachine)

  service.onTransition((newState) => {
    onStateChange(newState)
  })

  const onConfigValid = () => {
    service.send({ type: EventType.ConfigValid })
  }

  const onConfigError = (error?: Error) => {
    service.send({ type: EventType.ConfigError, error })
  }

  const reset = () => {
    service.send({ type: EventType.Reset })
  }

  const startSync = () => {
    service.send({ type: EventType.Start })
  }

  const onDocumentsFetched = (
    shopifyDocuments: Array<Product | Collection>
  ) => {
    service.send({ type: EventType.FetchProgress, shopifyDocuments })
  }

  const onFetchComplete = () => {
    service.send({ type: EventType.FetchComplete })
  }

  const onTransactionsCreated = (transactions: PendingTransaction[]) => {
    service.send({ type: EventType.TransactionsPrepared, transactions })
  }

  const onTransactionProgress = (
    completedTransactions: CompleteTransaction[],
    erroredTransactions: ErroredTransaction[]
  ) => {
    service.send({
      type: EventType.SyncProgress,
      completedTransactions,
      erroredTransactions,
    })
  }

  return {
    initialState,
    reset,
    startSync,
    onConfigValid,
    onConfigError,
    onDocumentsFetched,
    onFetchComplete,
    onTransactionsCreated,
    onTransactionProgress,
  }
}
