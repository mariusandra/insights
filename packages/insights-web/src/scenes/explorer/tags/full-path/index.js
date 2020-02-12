import './styles.scss'

import React from 'react'
import { Icon } from 'antd'

export function FullPath ({ path, rootIcon = 'filter', rootIconTheme = '' }) {
  return (
    <div className='full-path-explorer-tag'>
      {path.split('.').map((part, index) => (
        <div key={index} className={index === 0 ? 'root' : 'part'}>
          {index > 0 ? <Icon type='link' /> : <Icon type={rootIcon} theme={rootIconTheme} />}
          <span style={{ paddingLeft: index > 0 ? 10 : 5 }}>{index > 0 ? '.' : ''}{part}</span>
        </div>
      ))}
    </div>
  )
}
