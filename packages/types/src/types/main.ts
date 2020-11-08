import { Mutation, SanityClient } from '@sanity/client'
import {
  SanityClientConfig,
  SanityShopifyDocumentPartial,
  SanityShopifyDocument,
  SanityPair,
} from './sanity'
import { ShopifySecrets, Product, Collection, ShopifyClient } from './shopify'
import { SyncMachineState } from './syncState'

export interface Secrets {
  sanity: SanityClientConfig
  shopify: ShopifySecrets
}

export interface SaneShopifyClientConfig {
  sanityClient: SanityClient
  shopifyClient: ShopifyClient
  onStateChange?: (state: SyncMachineState) => void
}

export interface SaneShopifyConfig {
  secrets: Secrets
  onStateChange?: (state: SyncMachineState) => void
}

export enum TransactionStatus {
  Pending = 'pending',
  Complete = 'complete',
  Errored = 'error',
}

interface BaseTransaction {
  id: string
  status: TransactionStatus
  shopifySource: Product | Collection
  mutation: Mutation
}

export enum TransactionType {
  Create = 'create',
  Patch = 'patch',
  Archive = 'archive',
  Link = 'link',
  Skip = 'skip',
}

export interface CreateTrx extends BaseTransaction {
  type: TransactionType.Create
  sanityDocument: SanityShopifyDocumentPartial
}

export interface PatchTrx extends BaseTransaction {
  type: TransactionType.Patch
  sanityDocument: SanityShopifyDocument
}

export interface LinkTrx extends BaseTransaction {
  type: TransactionType.Link
  pairs: SanityPair
}

export interface SkipTrx extends Omit<BaseTransaction, 'mutation'> {
  type: TransactionType.Skip
  sanityDocument: SanityShopifyDocument
}

export interface ArchiveTrx extends BaseTransaction {
  type: TransactionType.Archive
  sanityDocument: SanityShopifyDocument
}

type Transaction = CreateTrx | PatchTrx | LinkTrx | SkipTrx | ArchiveTrx

export type PendingTransaction = Transaction & {
  status: TransactionStatus.Pending
}

export type ErroredTransaction = Transaction & {
  status: TransactionStatus.Errored
  error: Error
}

export type CompleteTransaction = Transaction & {
  status: TransactionStatus.Complete
}
