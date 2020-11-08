import { EventObject, StateMachine, Typestate, StateSchema } from 'xstate'
import { Product, Collection } from './shopify'
import {
  PendingTransaction,
  CompleteTransaction,
  ErroredTransaction,
} from './main'

export interface SyncContext {
  ready: boolean
  complete: boolean
  error?: Error
  shopifyDocuments: Array<Product | Collection>
  transactionsPending: PendingTransaction[]
  transactionsComplete: CompleteTransaction[]
  transactionsErrored: ErroredTransaction[]
}

export enum SyncStates {
  Initial = 'initial',
  Setup = 'setup',
  Ready = 'ready',
  Fetching = 'fetching',
  PreparingTransactions = 'preparingTransactions',
  Syncing = 'syncing',
  Complete = 'complete',
}

export enum EventType {
  ConfigValid = 'configValid',
  ConfigEmpty = 'configEmpty',
  ConfigError = 'configError',
  Start = 'start',
  FetchProgress = 'fetchProgress',
  FetchComplete = 'fetchComplete',
  Reset = 'reset',
  TransactionsPrepared = 'transactionsPrepared',
  SyncProgress = 'syncProgress',
  SyncError = 'syncError',
  SyncComplete = 'syncComplete',
}

interface ConfigErrorEvent extends EventObject {
  type: EventType.ConfigError
  error?: Error
}

interface FetchProgressEvent extends EventObject {
  type: EventType.FetchProgress
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

export type Events =
  | { type: EventType.ConfigValid }
  | { type: EventType.ConfigEmpty }
  | ConfigErrorEvent
  | { type: EventType.Start }
  | { type: EventType.Reset }
  | { type: EventType.FetchComplete }
  | FetchProgressEvent
  | TransactionsPreparedEvent
  | SyncProgressEvent
  | SyncCompleteEvent

export interface SyncSchema extends StateSchema<SyncContext> {
  context: SyncContext
  initial: string
  id: string
  states: {
    [SyncStates.Initial]: Record<string, any>
    [SyncStates.Setup]: Record<string, any>
    [SyncStates.Ready]: Record<string, any>
    [SyncStates.Fetching]: Record<string, any>
    [SyncStates.PreparingTransactions]: Record<string, any>
    [SyncStates.Syncing]: Record<string, any>
    [SyncStates.Complete]: Record<string, any>
    on: Record<string, any>
  }
}

export type SyncMachineState = StateMachine<
  SyncContext,
  any,
  Events,
  Typestate<SyncContext>
>['initialState']

export interface SyncStateMachineArgs {
  onStateChange: (state: SyncMachineState) => void
}

export interface SyncStateMachine {
  initialState: SyncMachineState
  reset: () => void
  startSync: () => void
  onConfigValid: () => void
  onConfigError: (error?: Error) => void
  onDocumentsFetched: (shopifyDocuments: Array<Product | Collection>) => void
  onFetchComplete: () => void
  onTransactionsCreated: (transactions: PendingTransaction[]) => void
  onTransactionProgress: (
    completedTransactions: CompleteTransaction[],
    erroredTransactions: ErroredTransaction[]
  ) => void
}
