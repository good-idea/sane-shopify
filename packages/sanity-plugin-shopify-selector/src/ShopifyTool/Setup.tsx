import * as React from 'react'
import { uniqueId } from 'lodash'
import Button from 'part:@sanity/components/buttons/default'
import Fieldset from 'part:@sanity/components/fieldsets/default'
import FormField from 'part:@sanity/components/formfields/default'
import TextInput from 'part:@sanity/components/textinputs/default'
import { Provider, ClientContextValue } from '../Provider'

interface Props extends ClientContextValue {}

interface State {
	storefrontName: string
	storefrontApiKey: string
	loading: boolean
	error: boolean
	message: string
	success: boolean
}

const wrapperStyles = {
	padding: '15px',
	borderRadius: '5px',
	border: '1px solid #ccc',
}

const buttonWrapperStyles = {
	display: 'flex',
	justifyContent: 'center',
	marginTop: '10px',
}

const buttonStyles = {
	margin: '0 15px',
}

export class SetupBase extends React.Component<Props, State> {
	urlInputId = uniqueId('storefrontUrlInput')
	keyInputId = uniqueId('storefrontKeyInput')

	state = {
		storefrontName: this.props.secrets.storefrontName || '',
		storefrontApiKey: this.props.secrets.storefrontApiKey || '',
		loading: false,
		success: false,
		error: undefined,
		message: undefined,
	}

	handleInputChange = (field: 'storefrontName' | 'storefrontApiKey') => e => {
		if (field === 'storefrontName')
			this.setState({ storefrontName: e.target.value })
		if (field === 'storefrontApiKey')
			this.setState({ storefrontApiKey: e.target.value })
	}

	clear = () => {
		this.setState({
			storefrontName: this.props.secrets.storefrontName || '',
			storefrontApiKey: this.props.secrets.storefrontApiKey || '',
			error: false,
			message: undefined,
		})
	}

	handleSubmit = async () => {
		await this.setState({ loading: true })
		const { testSecrets, saveSecrets } = this.props
		const { storefrontName, storefrontApiKey } = this.state
		const { valid, data, message } = await testSecrets({
			storefrontName,
			storefrontApiKey,
		})
		if (!valid) {
			this.setState({
				loading: false,
				error: true,
				message,
			})
			return
		}
		await saveSecrets({ storefrontName, storefrontApiKey })
		await this.setState({
			loading: false,
			error: false,
			success: true,
			message,
		})
	}

	handleUnlink = async () => {
		await this.setState({ loading: true })
		this.props.clearSecrets()
		await this.setState({ loading: false })
	}

	render() {
		const {
			storefrontName,
			storefrontApiKey,
			loading,
			error,
			message,
			success,
		} = this.state

		if (!this.props.ready) return null

		if (this.props.valid) {
			return (
				<div style={wrapperStyles}>
					<Fieldset legend="Connected to Shopify" level={1} description="">
						<p>
							Unlinking your Shopify account will not remove any data in Sanity.
							But, it may cause syncing issues if you add new credentials later.
							Be sure to back up your content before unlinking.
						</p>
						<Button
							color="danger"
							disabled={loading}
							onClick={this.handleUnlink}
						>
							Unlink
						</Button>
					</Fieldset>
				</div>
			)
		}

		return (
			<div style={wrapperStyles}>
				<Fieldset
					legend="Setup"
					level={1}
					description="You need to provide your Shopify info before you can use this
					field. These credentials will be stored safely in a hidden document only available to editors."
				>
					{message ? (
						<p style={error ? { color: 'red' } : {}}>{message}</p>
					) : null}
					{!success && (
						<React.Fragment>
							<FormField
								label="Storefront Name"
								description="This is the first part of your shopify url, i.e. 'my-store.myshopify.com'"
								labelFor={this.urlInputId}
								level={0}
							>
								<TextInput
									id={this.urlInputId}
									onChange={this.handleInputChange('storefrontName')}
									type="text"
									disabled={success || loading}
									value={storefrontName}
								/>
							</FormField>
							<FormField
								description="In the 'App' section of your shopify settings, create a new private app with the Storefront API enabled."
								label="Storefront API Key"
								labelFor={this.keyInputId}
								level={0}
							>
								<TextInput
									id={this.keyInputId}
									disabled={success || loading}
									onChange={this.handleInputChange('storefrontApiKey')}
									value={storefrontApiKey}
									type="password"
								/>
							</FormField>
						</React.Fragment>
					)}
					<div style={buttonWrapperStyles}>
						<Button
							loading={success || loading}
							disabled={success}
							color="primary"
							kind="default"
							onClick={this.handleSubmit}
							style={buttonStyles}
						>
							Save Credentials
						</Button>
					</div>
				</Fieldset>
			</div>
		)
	}
}

export const Setup = () => (
	<Provider>{clientProps => <SetupBase {...clientProps} />}</Provider>
)
