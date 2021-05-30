import { uniqueId } from 'lodash'
import * as React from 'react'
import { Stack, Button, Box, Text, TextInput } from '@sanity/ui'
import { ClientContextValue, SaneConsumer } from '../Provider'

/* tslint:disable */
const FormField = require('part:@sanity/components/formfields/default').default
/* tslint:enable */

interface State {
  _id: string
  shopName: string
  accessToken: string
  loading: boolean
  error: boolean
  success: boolean
}

export class SetupBase extends React.Component<ClientContextValue, State> {
  public urlInputId = uniqueId('storefrontUrlInput')
  public keyInputId = uniqueId('storefrontKeyInput')

  public state = {
    _id: this.props?.config?._id || '',
    shopName: this.props?.config?.shopName || '',
    accessToken: this.props?.config?.accessToken || '',
    loading: false,
    success: false,
    error: false,
  }

  public handleInputChange =
    (field: 'shopName' | 'accessToken') =>
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      if (field === 'shopName') this.setState({ shopName: e.target.value })
      if (field === 'accessToken')
        this.setState({ accessToken: e.target.value })
    }

  public clear = (): void => {
    this.setState({
      _id: this.props?.config?._id || '',
      shopName: this.props?.config?.shopName || '',
      accessToken: this.props?.config?.accessToken || '',
      error: false,
    })
  }

  public handleSubmit = async (): Promise<void> => {
    this.setState({ loading: true })
    const { saveConfig } = this.props
    const { shopName, accessToken } = this.state
    await saveConfig({ shopName, accessToken })
    this.setState({ loading: false })
  }

  public handleUnlink = async (): Promise<void> => {
    if (
      window.confirm(
        'Are you sure you want to remove your Shopify credentials?'
      )
    ) {
      this.setState({ loading: true })
      if (this.props.syncingClient && this.props.config) {
        await this.props.syncingClient.clearConfig(this.props.config?.shopName)
      }
      this.setState({ loading: false })
    }
  }

  public render(): React.ReactNode {
    const { shopName, accessToken, loading, success } = this.state
    const { syncState } = this.props
    const { ready, valid, errorMessage } = syncState.context

    if (!ready) return null
    if (valid) {
      return (
        <Box marginBottom={[1, 2, 6]}>
          <Box marginBottom={[1, 2, 4]}>
            <Text size={1} weight="bold">
              Unlink
            </Text>
          </Box>
          <Box marginBottom={[1, 2, 4]}>
            <Button
              style={{ width: '100%' }}
              radius={0}
              fontSize={2}
              padding={[3, 3, 4]}
              tone="critical"
              disabled={loading}
              text="Unlink Storefront"
              onClick={this.handleUnlink}
            />
          </Box>
          <Text weight="bold" size={1}>
            Unlinking your Shopify account will not remove any data in Sanity.
            But, it may cause syncing issues if you add new credentials later.
            Be sure to back up your content before unlinking.
          </Text>
        </Box>
      )
    }

    return (
      <Box>
        {errorMessage ? (
          <Text size={1} style={errorMessage ? { color: 'red' } : {}}>
            {errorMessage}
          </Text>
        ) : null}
        {!success && (
          <Stack space={[3, 3, 4, 5]}>
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
              label="Storefront Access Token"
              labelFor={this.keyInputId}
              level={0}
            >
              <TextInput
                id={this.keyInputId}
                disabled={success || loading}
                onChange={this.handleInputChange('accessToken')}
                value={accessToken}
                type="text"
              />
            </FormField>
            <Box>
              <Button
                radius={0}
                fontSize={2}
                padding={[3, 3, 4]}
                tone="primary"
                disabled={success}
                text="Save Credentials"
                onClick={this.handleSubmit}
              />
            </Box>
          </Stack>
        )}
      </Box>
    )
  }
}

export const Setup = () => (
  <SaneConsumer>
    {(clientProps) => (clientProps ? <SetupBase {...clientProps} /> : null)}
  </SaneConsumer>
)
