import { uniqueId } from 'lodash-es'
import * as React from 'react'
import { ClientContextValue, Provider } from '../Provider'
/* tslint:disable */
const Button = require('part:@sanity/components/buttons/default').default
const Fieldset = require('part:@sanity/components/fieldsets/default').default
const FormField = require('part:@sanity/components/formfields/default').default
const TextInput = require('part:@sanity/components/textinputs/default').default
/* tslint:enable */

interface State {
  shopName: string
  accessToken: string
  loading: boolean
  error: boolean
  message: string
  success: boolean
}

const buttonWrapperStyles = {
  display: 'flex',
  justifyContent: 'center',
  marginTop: '10px'
}

const buttonStyles = {
  margin: '0 15px'
}

export class SetupBase extends React.Component<ClientContextValue, State> {
  public urlInputId = uniqueId('storefrontUrlInput')
  public keyInputId = uniqueId('storefrontKeyInput')

  public state = {
    shopName: this.props.secrets.shopName || '',
    accessToken: this.props.secrets.accessToken || '',
    loading: false,
    success: false,
    error: undefined,
    message: undefined
  }

  public handleInputChange = (field: 'shopName' | 'accessToken') => (e) => {
    if (field === 'shopName') this.setState({ shopName: e.target.value })
    if (field === 'accessToken') this.setState({ accessToken: e.target.value })
  }

  public clear = () => {
    this.setState({
      shopName: this.props.secrets.shopName || '',
      accessToken: this.props.secrets.accessToken || '',
      error: false,
      message: undefined
    })
  }

  public handleSubmit = async () => {
    await this.setState({ loading: true })
    const { testSecrets, saveSecrets } = this.props
    const { shopName, accessToken } = this.state
    const { valid, data, message } = await testSecrets({
      shopName,
      accessToken
    })
    if (!valid) {
      this.setState({
        message,
        loading: false,
        error: true
      })
      return
    }
    await saveSecrets({ shopName, accessToken })
    await this.setState({
      message,
      loading: false,
      error: false,
      success: true
    })
  }

  public handleUnlink = async () => {
    await this.setState({ loading: true })
    this.props.clearSecrets()
    await this.setState({ loading: false })
  }

  public render() {
    const {
      shopName,
      accessToken,
      loading,
      error,
      message,
      success
    } = this.state

    if (!this.props.ready) return null
    if (this.props.valid) {
      return (
        <Fieldset legend="Account Setup" level={1} description="">
          <p>
            Connected to shopify storefront{' '}
            <strong>{this.props.secrets.shopName}</strong>
          </p>

          <Button color="danger" disabled={loading} onClick={this.handleUnlink}>
            Unlink
          </Button>
          <h5>
            <em>
              Unlinking your Shopify account will not remove any data in Sanity.
              But, it may cause syncing issues if you add new credentials later.
              Be sure to back up your content before unlinking.
            </em>
          </h5>
        </Fieldset>
      )
    }

    return (
      <Fieldset
        legend="Account Setup"
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
              description="This is the first part of your shopify url,
              i.e. 'my-store.myshopify.com'"
              labelFor={this.urlInputId}
              level={0}
            >
              <TextInput
                id={this.urlInputId}
                onChange={this.handleInputChange('shopName')}
                type="text"
                disabled={success || loading}
                value={shopName}
              />
            </FormField>
            <FormField
              description="In the 'App' section of your shopify settings,
              create a new private app with the Storefront API enabled."
              label="Storefront API Key"
              labelFor={this.keyInputId}
              level={0}
            >
              <TextInput
                id={this.keyInputId}
                disabled={success || loading}
                onChange={this.handleInputChange('accessToken')}
                value={accessToken}
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
    )
  }
}

export const Setup = () => (
  <Provider>{(clientProps) => <SetupBase {...clientProps} />}</Provider>
)
