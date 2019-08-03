import * as React from 'react'
import { ShopifySecrets } from '@sane-shopify/types'
import { Provider } from '../Provider'
import { ClientContextValue, SanityInputProps } from '../types'
import { ShopifyInput } from './ShopifyInput'

interface InputProps extends ClientContextValue {
  inputProps: SanityInputProps
}

interface State {
  initialized: boolean
  secrets: ShopifySecrets | null
  valid?: boolean
}

export class MainBase extends React.Component<InputProps, State> {
  public render() {
    const { secrets, ready, valid, shopifyClient, inputProps } = this.props
    if (!ready) return null
    if (!valid || Boolean(!secrets.storefrontName || !secrets.storefrontApiKey)) {
      return <p>Your store is not yet configured. Go to the Shopify tab above to add your keys.</p>
    }
    if (secrets) return <ShopifyInput shopifyClient={shopifyClient} {...inputProps} />
    return null
  }
}

/* Pass the secrets in as props so we can inject for testing */
export const Main = (props: SanityInputProps) => (
  <Provider>{(contextProps) => <MainBase {...contextProps} inputProps={props} />}</Provider>
)
