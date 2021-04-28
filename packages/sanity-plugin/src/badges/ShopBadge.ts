import { IResolverProps } from '../types'

export const ShopBadge = (props: IResolverProps) => {
  if (
    props?.published?._type === 'shopifyProduct' ||
    props?.published?._type === 'shopifyCollection'
  ) {
    return {
      label: props?.published?.sourceData?.shopName || 'Unknown source',
      color: 'success',
    }
  } else {
    return null
  }
}
