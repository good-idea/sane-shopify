import * as React from 'react'

interface ValueProps {
  label: string
  value: number | string
}

export const textStyles = {
  fontWeight: 400,
  display: 'inline-block',
  margin: 0
}

export const Value = ({ label, value }: ValueProps) => {
  return (
    <div>
      <h5
        style={{
          ...textStyles,
          color: 'rgba(48, 48, 48, 0.8)',
          marginRight: '0.35em'
        }}
      >
        {label}:
      </h5>
      <h5 style={{ ...textStyles, fontWeight: 500 }}>{value}</h5>
    </div>
  )
}
