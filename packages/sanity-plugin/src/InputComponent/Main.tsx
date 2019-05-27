import * as React from 'react'
import { ShopifyInput } from './ShopifyInput'
import { SanityInputProps, Secrets, ClientContextValue } from '../types'
import { Provider } from '../Provider'

interface InputProps extends ClientContextValue {
  inputProps: SanityInputProps
}

interface State {
  initialized: boolean
  secrets: Secrets | null
  valid?: boolean
}

export class MainBase extends React.Component<InputProps, State> {
  render() {
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
