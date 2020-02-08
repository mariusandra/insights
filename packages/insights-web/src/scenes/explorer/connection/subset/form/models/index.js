import './styles.scss'

import React from 'react'
import { useActions, useValues } from 'kea'
import { Tree, Icon, Tag, Button, Tooltip } from 'antd'
import EditColumn, { columnIcon, fieldIcon } from './edit-column'

import logic from './logic'

const ModelTitle = ({ model, ignoredColumnCount }) => {
  const diff = ignoredColumnCount[model] || 0
  return <span>{model} {diff > 0 ? <Tag className='ignore-tag'>{diff} field{diff === 1 ? '' : 's'} ignored</Tag> : null}</span>
}

const FieldTitle = ({ structure, model, field, editColumn }) => {
  return (
    <div className='tree-column-row'>
      <span className={`column-key${field.newField ? ' new-column' : ''}`}>
        {field.key}
        {field.meta.index === 'primary_key' ? <Tooltip title="Primary Key"><Icon type="idcard" /></Tooltip> : null}
        {field.newField ? <Tag className='new-tag' color='red'>new</Tag> : null}
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
        ) : field.type === 'custom' ? (
          <Tag color='green'>
            <Icon type='code' /> {field.meta.sql}
          </Tag>
        ) : null}
        {field.type === 'column' || field.type === 'custom' ? (
          <Tag color='orange'>
            <Icon type={columnIcon[field.meta.type] || 'question-circle'} /> {field.meta.type}
          </Tag>
        ) : null}
        <Icon type='edit' onClick={() => editColumn(`${model}.${field.key}`)}  />
      </div>
    </div>
  )
}

export default function Models () {
  const { sortedModels, structure, sortedStructure, checkedModelsLookup, checkedKeys, editingColumn, ignoredColumnCount } = useValues(logic)
  const { setCheckedKeysRaw, addCustomField, editColumn, closeEdit, toggle } = useActions(logic)

  return (
    <div>
      <h3>
        Select models and fields to include in this subset
        <Button type='link' onClick={toggle}>Toggle All</Button>
      </h3>

      <Tree
        selectable
        selectedKeys={[]}
        showLine
        switcherIcon={<Icon type="down" />}
        blockNode
        checkable
        checkedKeys={checkedKeys}
        onCheck={setCheckedKeysRaw}
        className='models-select-tree'
      >
        {sortedModels.map(model => (
          <Tree.TreeNode
            key={model}
            showLine
            title={<ModelTitle model={model} ignoredColumnCount={ignoredColumnCount} sortedStructure={sortedStructure} />}
          >
            {sortedStructure[model].map(field => (
              <Tree.TreeNode
                disabled={field.type === 'link' && !checkedModelsLookup[field.meta.model]}
                switcherIcon={<Icon type={fieldIcon[field.type]} />}
                key={`${model}.${field.key}`}
                title={<FieldTitle structure={structure} model={model} field={field} editColumn={editColumn} />}
              />
            ))}

            <Tree.TreeNode
              checkable={false}
              switcherIcon={<Icon type='plus' />}
              key={`${model}...new_custom`}
              title={<div style={{ cursor: 'pointer' }} onClick={() => addCustomField(model)}>Add custom field</div>}
            />

          </Tree.TreeNode>
        ))}
      </Tree>

      <EditColumn visible={!!editingColumn} column={editingColumn} closeEdit={closeEdit} />
    </div>
  )
}
