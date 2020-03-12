import * as React from 'react'

interface ValueProps {
  label: string
  value: number | string
}

const textStyles = {
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

interface StatusBarProps {
  text: string
  complete?: number
  total?: number
}

const progressOuterStyles = {
  width: 150,
  height: 10,
  backgroundColor: '#ccc',
  borderRadius: '10px',
  position: 'relative' as 'relative'
}

const progressInnerStyles = {
  position: 'absolute' as 'absolute',
  top: 0,
  left: 0,
  height: '100%'
}

const barStyles = {
  display: 'flex' as 'flex',
  alignItems: 'center' as 'center'
}

export const StatusBar = ({ text, complete, total }: StatusBarProps) => {
  const progressWidth =
    complete !== undefined && total !== undefined
      ? `${(complete / total) * 100}%`
      : '0'
  return (
    <div>
      <h5 style={textStyles}>{text}</h5>
      {complete !== undefined && total !== undefined ? (
        <div style={barStyles}>
          <div style={progressOuterStyles}>
            <div style={{ ...progressInnerStyles, width: progressWidth }} />
          </div>
          <h5 style={{ ...textStyles, marginLeft: '0.3em' }}>
            {complete}/{total}
          </h5>
        </div>
      ) : complete !== undefined ? (
        <h5 style={textStyles}>{complete}</h5>
      ) : null}
    </div>
  )
}
