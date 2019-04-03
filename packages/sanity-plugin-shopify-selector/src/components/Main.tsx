import * as React from 'react'
import { Setup } from './Setup'
import { ShopifyInput } from './ShopifyInput'
import { ClientProvider, ClientConsumer } from './ClientContext'

import { Secrets, SanityInputProps, ClientContextValue } from './types'

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
		const { secrets, ready, valid, inputProps } = this.props

		if (!ready) return null
		if (
			!valid ||
			Boolean(!secrets.storefrontName || !secrets.storefrontApiKey)
		) {
			return <Setup {...this.props} />
		}
		if (secrets) return <ShopifyInput secrets={secrets} {...inputProps} />
	}
}

/* Pass the secrets in as props so we can inject for testing */
export const Main = (props: SanityInputProps) => (
	<ClientProvider>
		{contextProps => <MainBase {...contextProps} inputProps={props} />}
	</ClientProvider>
)
