import { Icon, Tag, Tooltip } from 'antd'
import { columnIcon } from '../edit-field'
import React from 'react'

export default function FieldRow ({ structure, model, field, editField }) {
  return (
    <div className='tree-column-row'>
      <span className={`column-key${field.newField ? ' new-column' : ''}`}>
        {field.key}
        {field.meta.index === 'primary_key' ? <Tooltip title="Primary Key"><Icon type="idcard" /></Tooltip> : null}
        {field.newField ? <Tooltip title="Manually Added Field"><Icon type="user-add" /></Tooltip> : null}
      </span>

      <div className='column-meta'>
        {field.type === 'link' && structure[model].columns[field.meta.my_key] && structure[model].columns[field.meta.my_key].index === 'primary_key' ? (
          <Tag color='geekblue'>
            <Icon type="link" /> {field.meta.model}.{field.meta.model_key} <Icon type="ellipsis" />  {field.meta.my_key}
          </Tag>
        ) : field.type === 'link' ? (
          <Tag color='geekblue'>
            <Icon type="link" /> {field.meta.my_key} <Icon type="ellipsis" />  {field.meta.model}.{field.meta.model_key}
          </Tag>
        ) : field.type === 'column' ? (
          <Tag color='orange'>
            <Icon type={columnIcon[field.meta.type] || 'question-circle'} /> {field.meta.type}
          </Tag>
        ) : field.type === 'custom' ? (
          <Tag color='green'>
            <Icon type={columnIcon[field.meta.type] || 'code'} /> {field.meta.sql}
          </Tag>
        ) : null}
        <Icon type='edit' onClick={() => editField(model, field.key, field.editType)}  />
      </div>
    </div>
  )
}
