import { Tag } from 'antd'
import React from 'react'

export default function ModelRow ({ model, ignoredColumnCount }) {
  const diff = ignoredColumnCount[model] || 0
  return <span>{model} {diff > 0 ? <Tag className='ignore-tag'>{diff} field{diff === 1 ? '' : 's'} ignored</Tag> : null}</span>
}
