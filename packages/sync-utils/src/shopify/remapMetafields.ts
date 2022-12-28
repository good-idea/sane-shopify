import { Variant, Metafield } from '@sane-shopify/types'

type Product = Record<string, any>

const isMetafield = (obj: Record<string, any>): obj is Metafield =>
  Boolean(obj && obj.value && obj.namespace && obj.key)

const omit = <T extends Record<string, any>>(obj: T, toOmit: string): T => {
  return Object.entries(obj).reduce((prev, [key, value]) => {
    if (key === toOmit) return prev
    return {
      ...prev,
      [key]: value,
    }
  }, {} as T)
}

/**
 * This plugin was initially created when the Storefront API returned
 * all metafields in a paginated object. Newer versions of the API
 * require that you query for each metafield individually, using a custom
 * property name.
 *
 * The metafieldsToQuery utility in ./queryFragments.ts fetches metafields
 * with a property name in the format of metafield_<namespace>_<key>.
 *
 * For the sake of backwards compatibility, this function will transform
 * the response by remapping these individual properties into a paginated
 * object.
 */
export const remapMetafields = <T extends Product | Variant>(item: T): T => {
  const itemWithEmptyMetafields = {
    ...item,
    metafields: {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
      edges: [],
    },
  }
  const remapped = Object.entries(item).reduce<T>((prev, [key, value]) => {
    const metafieldMatch = key.match(/metafield_/)
    if (metafieldMatch?.input && isMetafield(value)) {
      const metafieldMatchName = metafieldMatch.input
      const prevWithoutMetafieldProperty = omit(prev, metafieldMatchName)
      const prevEdges = prev?.metafields?.edges || []
      const { value: metafieldValue, namespace, key } = value
      const newEdge = {
        id: `${namespace}-${key}-${metafieldValue}`,
        node: {
          namespace,
          key,
          value: metafieldValue,
        },
      }
      return {
        ...prevWithoutMetafieldProperty,
        metafields: {
          ...prev.metafields,
          edges: [...prevEdges, newEdge],
        },
      }
    }
    return prev
  }, itemWithEmptyMetafields)

  /* If we have a product with variants, remap those variants as well */
  if (
    remapped.__typename === 'Product' &&
    'variants' in remapped &&
    remapped?.variants?.edges?.length
  ) {
    return {
      ...remapped,
      variants: {
        ...remapped.variants,
        edges: remapped.variants.edges.map((variantEdge) => ({
          ...variantEdge,
          node: remapMetafields(variantEdge.node),
        })),
      },
    }
  }

  return remapped
}
