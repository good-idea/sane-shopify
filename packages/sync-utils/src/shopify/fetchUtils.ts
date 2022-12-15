import Debug from 'debug'
import { QueryResultRejected } from './types'

export const log = Debug('sane-shopify:fetching')

export const hasTimeoutErrors = (result: QueryResultRejected): boolean =>
  result.errors.some((error) => error.message === 'Timeout')
