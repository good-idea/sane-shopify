import { partition } from 'ramda'
import { Product, Collection } from '../../../types'

interface Pair<A, B> {
	shopifyItem: A
	sanityDoc: B
}

interface Results<ShopifyItem, Doc> {
	matches: Pair<ShopifyItem, Doc>[]
	needsUpdate: Pair<ShopifyItem, Doc>[]
	needsDoc: ShopifyItem[]
	needsDisabling: Doc[]
}

interface ShopifyItem {
	id: number
}

interface SanityDoc {
	shopifyId: number
}

const pull = (fn, arr) => {
	const index = arr.findIndex(fn)
	return [arr[index], [...arr.slice(0, index - 1), ...arr.slice(index + 1)]]
}

export const organizeResults = <A extends ShopifyItem, B extends SanityDoc>(
	items: A[],
	docs: B[],
): Results<A, B> => {
	console.log(items[0])
	console.log(docs[0])
	const matchReducer = (acc, { items, docs }) => {
		console.log('reducing...')
		console.log(acc, items, docs)
		if (items.length) {
			const [item, ...restItems] = items
			const [matchingDoc, ...nonMatchingDocs] = pull(
				d => d.shopifyId === item.id,
				docs,
			)
			if (matchingDoc) {
				const match = [item, matchingDoc]
				const nextState = {
					...acc,
					matches: [...acc.matches, match],
				}
				return matchReducer(nextState, {
					items: restItems,
					docs: nonMatchingDocs[0],
				})
			}
		} else if (docs.length) {
		}
		return acc
	}

	const result = matchReducer(
		{
			matches: [],
			needsUpdate: [],
			needsDoc: [],
			needsDisabling: [],
		},
		{ items, docs },
	)
	console.log(result)
	return result
}
