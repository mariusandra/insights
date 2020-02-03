import './styles.scss'

import React from 'react'
import { useActions, useValues } from 'kea'
import { Tree, Icon, Tag } from 'antd'
import EditColumn from './edit-column'

import logic from './logic'

const icons = {
  column: 'tag',
  link: 'link',
  custom: 'form'
}

const columnIcon = {
  number: 'number',
  time: 'clock-circle',
  string: 'font-size',
  boolean: 'tag'
}

const ModelTitle = ({ model, cleanSubset, sortedStructure }) => {
  if (!cleanSubset[model] || cleanSubset[model] === true) {
    return <span>{model}</span>
  } else {
    const diff = sortedStructure[model].length - cleanSubset[model].length
    return <span>{model} <Tag>{diff} field{diff === 1 ? '' : 's'} ignored</Tag></span>
  }
}

const FieldTitle = ({ structure, model, field, editColumn }) => {
  return (
    <div className='tree-column-row'>
      <span className='column-key'>
        {field.key}
        {field.meta.index === 'primary_key' ? <Icon type="idcard" title='Primary Key' /> : ''}
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
            <Icon type='code' /> {field.meta.sql}
          </Tag>
        ) : null}
        <Icon type='edit' onClick={() => editColumn(`${model}.${field.key}`)}  />
      </div>
    </div>
  )
}

export default function Models () {
  const { sortedModels, structure, sortedStructure, checkedModelsLookup, checkedKeys, editingColumn, cleanSubset } = useValues(logic)
  const { setCheckedKeys, editColumn, closeEdit } = useActions(logic)

  return (
    <div>
      <Tree
        selectable
        selectedKeys={[]}
        showLine
        switcherIcon={<Icon type="down" />}
        blockNode
        checkable
        checkedKeys={checkedKeys}
        onCheck={setCheckedKeys}
        className='models-select-tree'
      >
        {sortedModels.map(model => (
          <Tree.TreeNode
            key={model}
            showLine
            title={<ModelTitle model={model} cleanSubset={cleanSubset} sortedStructure={sortedStructure} />}
          >
            {sortedStructure[model].map(field => (
              <Tree.TreeNode
                // disabled={field.type === 'link' && !checkedModelsLookup[field.meta.model]}
                disableCheckbox={field.type === 'link' && !checkedModelsLookup[field.meta.model]}
                switcherIcon={<Icon type={icons[field.type]} />}
                key={`${model}.${field.key}`}
                title={<FieldTitle structure={structure} model={model} field={field} editColumn={editColumn} />}
              />
            ))}

            <Tree.TreeNode
              checkable={false}
              switcherIcon={<Icon type='plus' />}
              key={`${model}...new_custom`}
              title='Add custom field'
            />

          </Tree.TreeNode>
        ))}
      </Tree>
      <EditColumn visible={!!editingColumn} column={editingColumn} closeEdit={closeEdit} />
    </div>
  )
}
