import * as React from 'react'
import { AiOutlineQuestionCircle } from 'react-icons/ai'

const imageWrapperStyles = {
  background: '#f0f0f0',
  width: '100%',
  height: '100%',
  borderRadius: '3px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#acacac'
}

export const MissingImage = () => (
  <div style={imageWrapperStyles}>
    <AiOutlineQuestionCircle fill="currentColor" />
  </div>
)
