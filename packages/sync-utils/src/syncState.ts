import {
  Machine,
  EventObject,
  StateMachine,
  Typestate,
  interpret,
  StateSchema,
  assign,
} from 'xstate'
import {
  Product,
  Collection,
  PendingTransaction,
  CompleteTransaction,
  ErroredTransaction,
} from '@sane-shopify/types'

interface SyncContext {
  shopifyDocuments: Array<Product | Collection>
  transactionsPending: PendingTransaction[]
  transactionsComplete: CompleteTransaction[]
  transactionsErrored: ErroredTransaction[]
}

const initialContext: SyncContext = {
  shopifyDocuments: [],
  transactionsPending: [],
  transactionsComplete: [],
  transactionsErrored: [],
}

enum States {
  Ready = 'ready',
  Fetching = 'fetching',
  PreparingTransactions = 'preparingTransactions',
  Syncing = 'syncing',
  Complete = 'complete',
}

enum EventType {
  Start = 'start',
  FetchComplete = 'fetchComplete',
  Reset = 'reset',
  TransactionsPrepared = 'transactionsPrepared',
  SyncProgress = 'syncProgress',
  SyncError = 'syncError',
  SyncComplete = 'syncComplete',
}

interface FetchCompleteEvent extends EventObject {
  type: EventType.FetchComplete
  shopifyDocuments: Array<Product | Collection>
}

interface TransactionsPreparedEvent extends EventObject {
  type: EventType.TransactionsPrepared
  transactions: PendingTransaction[]
}

interface SyncProgressEvent extends EventObject {
  type: EventType.SyncProgress
  completedTransactions: CompleteTransaction[]
  erroredTransactions: ErroredTransaction[]
}

interface SyncCompleteEvent extends EventObject {
  type: EventType.SyncComplete
}

type Events =
  | { type: EventType.Start }
  | { type: EventType.Reset }
  | FetchCompleteEvent
  | TransactionsPreparedEvent
  | SyncProgressEvent
  | SyncCompleteEvent

export interface SyncSchema extends StateSchema<SyncContext> {
  context: SyncContext
  initial: string
  id: string
  states: {
    [States.Ready]: Record<string, any>
    [States.Fetching]: Record<string, any>
    [States.PreparingTransactions]: Record<string, any>
    [States.Syncing]: Record<string, any>
  }
}

const schema: SyncSchema = {
  id: 'syncMachine',
  initial: States.Ready,
  context: initialContext,
  states: {
    [States.Ready]: {
      on: {
        [EventType.Start]: States.Fetching,
      },
    },
    [States.Fetching]: {
      on: {
        [EventType.FetchComplete]: {
          target: States.PreparingTransactions,
          actions: 'saveDocuments',
        },
      },
    },
    [States.PreparingTransactions]: {
      on: {
        [EventType.TransactionsPrepared]: {
          target: States.Syncing,
          actions: 'saveTransactions',
        },
      },
    },
    [States.Syncing]: {
      on: {
        [EventType.SyncProgress]: {
          internal: true,
          actions: 'saveSyncProgress',
        },
        [EventType.SyncComplete]: {
          target: States.Syncing,
          actions: 'saveTransactions',
        },
      },
    },
  },
}

const syncMachine = Machine<SyncContext, Events>(schema, {
  actions: {
    // @ts-ignore https://github.com/davidkpiano/xstate/issues/866
    saveDocuments: assign<SyncContext, FetchCompleteEvent>({
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
})

export type SyncMachineState = StateMachine<
  SyncContext,
  any,
  Events,
  Typestate<SyncContext>
>['initialState']

interface SyncStateMachineArgs {
  onStateChange: (state: SyncMachineState) => void
}

export interface SyncStateMachine {
  initialState: SyncMachineState
  reset: () => void
  startSync: () => void
  onDocumentsFetched: (shopifyDocuments: Array<Product | Collection>) => void
  onTransactionsCreated: (transactions: PendingTransaction[]) => void
  onTransactionProgress: (
    completedTransactions: CompleteTransaction[],
    erroredTransactions: ErroredTransaction[]
  ) => void
}

export const syncStateMachine = ({
  onStateChange,
}: SyncStateMachineArgs): SyncStateMachine => {
  const { initialState } = syncMachine
  const service = interpret<SyncContext, SyncSchema, Events>(syncMachine)

  service.onTransition((newState) => {
    onStateChange(newState)
  })

  const reset = () => {
    service.send({ type: EventType.Reset })
  }

  const startSync = () => {
    service.send({ type: EventType.Start })
  }

  const onDocumentsFetched = (
    shopifyDocuments: Array<Product | Collection>
  ) => {
    service.send({ type: EventType.FetchComplete, shopifyDocuments })
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
    onDocumentsFetched,
    onTransactionsCreated,
    onTransactionProgress,
  }
}
