import { SanityDocumentConfig, SanityField } from '@sane-shopify/types'

interface Fields {
  additionalFields: SanityField[]
  namedFields: {
    [key: string]: Partial<SanityField>
  }
}

export const getFieldConfig = (
  fields: SanityDocumentConfig['fields'] = [],
  fieldNames: string[] = []
): Fields => {
  const namedFields = fieldNames.reduce((acc, name) => {
    const fieldConfig = fields.find((f) => f.name === name) || {}
    return {
      ...acc,
      [name]: fieldConfig,
    }
  }, {})
  const additionalFields = fields.filter(
    (field) => !fieldNames.includes(field.name)
  )
  return { namedFields, additionalFields }
}
