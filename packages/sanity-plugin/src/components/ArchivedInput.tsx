import * as React from 'react'

interface ArchivedInputProps {
  value: boolean | undefined
}

const pStyles = {
  backgroundColor: 'rgb(236, 236, 236)',
  padding: '10px',
  color: 'red'
}

export class ArchivedInput extends React.Component<ArchivedInputProps> {
  render() {
    const { value } = this.props
    if (value === true) {
      return (
        <p style={pStyles}>
          This product no longer exists in Shopify. It has been archived here in
          Sanity for reference.
        </p>
      )
    }
    return null
  }
}
