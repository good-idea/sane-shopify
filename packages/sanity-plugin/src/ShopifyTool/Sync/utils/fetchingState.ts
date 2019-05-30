/**
 * Didn't end up using this...
 * But it's a nice mini-example of functional state management
 */

interface FetchingState<Label = string> {
  label: Label
  status: 'uninitialized' | 'fetching' | 'complete'
  total?: number
  fetched: number
}

export const STARTED = 'STARTED'
export const FETCHED_TOTAL = 'FETCHED_TOTAL'
export const FETCHED_ITEMS = 'FETCHED_TOTAL'
export const COMPLETED = 'COMPLETED'

interface StartAction {
  type: typeof STARTED
}

interface FetchedTotalAction {
  type: typeof FETCHED_TOTAL
  payload: {
    count: number
  }
}

interface FetchedItemsAction {
  type: typeof FETCHED_ITEMS
  payload: {
    count: number
  }
}

interface CompletedAction {
  type: typeof COMPLETED
}
type Action = StartAction | FetchedTotalAction | FetchedItemsAction | CompletedAction

const reducer = (prevState: FetchingState, action: Action) => {
  switch (action.type) {
    case STARTED:
      return {
        ...prevState,
        status: 'fetching' as 'fetching'
      }
    case FETCHED_TOTAL:
      return {
        ...prevState,
        total: action.payload.count
      }
    case FETCHED_ITEMS:
      const newFetchedCount = prevState.fetched + action.payload.count
      return {
        ...prevState,
        fetched: newFetchedCount,
        status: newFetchedCount === prevState.total ? ('complete' as 'complete') : prevState.status
      }
    case COMPLETED:
      return {
        ...prevState,
        status: 'complete' as 'complete'
      }

    default:
      return prevState
  }
}

export type FetchingStateAndUpdaters = [FetchingState, Updaters]

interface Updaters {
  start: () => FetchingStateAndUpdaters
  fetchedTotal: (count: number) => FetchingStateAndUpdaters
  fetchedItems: (count: number) => FetchingStateAndUpdaters
  complete: () => FetchingStateAndUpdaters
}

const createUpdaters = (prevState: FetchingState): Updaters => {
  // const newState = reducer(prevState, action)
  const update = (action: Action) => {
    const newState = reducer(prevState, action)
    const updaters = createUpdaters(newState)
    const returned: FetchingStateAndUpdaters = [newState as FetchingState, updaters as Updaters]
    return returned
  }

  const start = () => update({ type: STARTED })
  const fetchedTotal = (count: number) => update({ type: FETCHED_TOTAL, payload: { count } })
  const fetchedItems = (count: number) => update({ type: FETCHED_ITEMS, payload: { count } })
  const complete = () => update({ type: COMPLETED })

  return {
    start,
    fetchedTotal,
    fetchedItems,
    complete
  }
}

export const createFetchingState = (label): FetchingStateAndUpdaters => {
  const initialState = {
    label,
    status: 'uninitialized' as 'uninitialized',
    total: undefined,
    fetched: 0
  }

  return [initialState, createUpdaters(initialState)]
}
