import { Typestate, StateMachine, StateSchema, EventObject } from 'xstate'

import { Product, Collection } from './shopify'
import { SyncOperation, LinkOperation } from './main'

/** Events */
export enum SyncEventType {
  Valid = 'VALID',
  SavedSecrets = 'SAVED_SECRETS',
  DocumentsFetched = 'DOCUMENTS_FETCHED',
  FetchComplete = 'FETCHED_COMPLETE',
  DocumentsSynced = 'DOCUMENTS_SYNCED',
  DocumentsLinked = 'DOCUMENTS_LINKED',
  Errored = 'ERRORED',
  Invalid = 'INVALID',
  Sync = 'SYNC',
  ClearedSecrets = 'CLEARED_SECRETS',
  Complete = 'COMPLETE',
  Reset = 'RESET',
}

export interface ReadyEvent extends EventObject {
  type: SyncEventType.Valid
  shopName: string
}

export interface SavedSecretsEvent extends EventObject {
  type: SyncEventType.SavedSecrets
  shopName: string
}

export interface DocumentsFetchedEvent extends EventObject {
  type: SyncEventType.DocumentsFetched
  shopifyDocuments: Array<Product | Collection>
}

export interface DocumentsFetchedCompleteEvent extends EventObject {
  type: SyncEventType.FetchComplete
  shopifyDocuments?: Array<Product | Collection>
}

export interface DocumentsSyncedEvent extends EventObject {
  type: SyncEventType.DocumentsSynced
  op: SyncOperation
}

export interface DocumentsLinkedEvent extends EventObject {
  type: SyncEventType.DocumentsLinked
  op: LinkOperation
}

export interface ErrorEvent extends EventObject {
  errorMessage: string
  error: Error
}

export interface SyncContext {
  documentsFetched: Array<Product | Collection>
  toSync: Array<Product | Collection>
  syncOperations: SyncOperation[]
  toLink: Array<Product | Collection>
  linkOperations: LinkOperation[]
  error: Error | void
  errorMessage: string | void
  valid: boolean
  ready: boolean
  shopName: string | void
}

export type SyncEvent =
  | { type: SyncEventType.Sync }
  | { type: SyncEventType.Invalid }
  | { type: SyncEventType.Complete }
  | { type: SyncEventType.ClearedSecrets }
  | { type: SyncEventType.Reset }
  | ReadyEvent
  | SavedSecretsEvent
  | DocumentsFetchedEvent
  | DocumentsFetchedCompleteEvent
  | DocumentsSyncedEvent
  | DocumentsLinkedEvent
  | ErrorEvent

export enum SyncStates {
  INIT = 'INIT',
  READY = 'READY',
  SETUP = 'SETUP',
  SYNCING = 'SYNCING',
  COMPLETE = 'COMPLETE',
  SYNC_ERROR = 'SYNC_ERROR',
}

export interface SyncSchema extends StateSchema {
  context: SyncContext
  states: {
    [SyncStates.INIT]: Record<string, any>
    [SyncStates.SETUP]: Record<string, any>
    [SyncStates.READY]: Record<string, any>
    [SyncStates.SYNCING]: Record<string, any>
    [SyncStates.COMPLETE]: Record<string, any>
    [SyncStates.SYNC_ERROR]: Record<string, any>
  }
}

export type SyncMachineState = StateMachine<
  SyncContext,
  any,
  SyncEvent,
  Typestate<SyncContext>
>['initialState']
