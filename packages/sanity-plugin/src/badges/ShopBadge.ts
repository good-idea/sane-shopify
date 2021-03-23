import { IResolverProps } from '../types'

export const ShopBadge = (props: IResolverProps) => {
  return {
    label: props?.published?.sourceData?.shopName || 'Unknown source',
    color: 'success',
  }
}