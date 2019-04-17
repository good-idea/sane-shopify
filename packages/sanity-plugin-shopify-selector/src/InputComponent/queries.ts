import { ShopifySelectorInputOptions, Product, Collection } from './types'

export interface QueryResult {
	products?: Product[]
	collections?: Collection[]
}

const productsFragment = /* GraphQL */ `
  products(first: 200) {
     edges {
        node {
           itemId: id
           handle
           title
           description
           itemType: __typename
           images(first: 1) {
              edges {
                 node {
                    id
                    altText
                    originalSrc
                    transformedSrc(maxWidth: 100)
                 }
              }
           }
        }
     }
  }
`

const collectionsFragment = /* GraphQL */ `
  collections(first: 100) {
     edges {
        node {
           itemId: id
           handle
           title
           description
           itemType: __typename
           image {
              id
              altText
              originalSrc
              transformedSrc(maxWidth: 100)
           }
        }
     }
  }
`

export const buildQuery = ({
	collections,
	products,
}: ShopifySelectorInputOptions): string => /* GraphQL */ `
{
   shop {
      ${collections ? collectionsFragment : ''}
      ${products ? productsFragment : ''}
   }
}
`
