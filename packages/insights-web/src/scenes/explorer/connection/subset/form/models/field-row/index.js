import { Icon, Tag, Tooltip } from 'antd'
import { columnIcon } from '../edit-field'
import React from 'react'

export default function FieldRow ({ structure, model, field, editField }) {
  return (
    <div className='tree-column-row'>
      <span className={`column-key${field.editType === 'new' ? ' new-column' : ''}${field.editType === 'edited' ? ' edited-column' : ''}`}>
        {field.key}
        {field.meta.index === 'primary_key' ? <Tooltip title="Primary Key"><Icon type="idcard" /></Tooltip> : null}
        {field.editType === 'new' ? <Tooltip title="Manually Added Field"><Icon type="user-add" /></Tooltip> : null}
        {field.editType === 'edited' ? <Tooltip title="Changes Made"><Icon type="setting" /></Tooltip> : null}
        {field.editType === 'edited' && field.originalKey !== field.key ? <Tooltip title={`Renamed from "${field.originalKey}"`}><Icon type="interaction" /></Tooltip> : null}
      </span>

      <div className='column-meta'>
        {field.type === 'link' && structure[model].columns[field.meta.my_key] && structure[model].columns[field.meta.my_key].index === 'primary_key' ? (
          <Tag color='geekblue'>
            <Icon type="link" /> <span>{field.meta.model}.{field.meta.model_key} <Icon type="ellipsis" /> {field.meta.my_key}</span>
          </Tag>
        ) : field.type === 'link' ? (
          <Tag color='geekblue'>
            <Icon type="link" /> <span>{field.meta.my_key} <Icon type="ellipsis" /> {field.meta.model}.{field.meta.model_key}</span>
          </Tag>
        ) : field.type === 'column' ? (
          <Tag color='orange'>
              <Icon type={columnIcon[field.meta.type] || 'question-circle'} /> <span>{field.meta.type}</span>
          </Tag>
        ) : field.type === 'custom' ? (
          <Tag color='green'>
            <Icon type={columnIcon[field.meta.type] || 'code'} /> <code>{field.meta.sql}</code>
          </Tag>
        ) : null}
        <Icon type='edit' onClick={() => editField(model, field.key, field.editType, field.originalKey)}  />
      </div>
    </div>
  )
}
