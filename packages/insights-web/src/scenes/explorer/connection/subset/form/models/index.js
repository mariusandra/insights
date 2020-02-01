import './styles.scss'

import React, { memo } from 'react'
import { kea, useActions, useValues } from 'kea'
import { Tree, Icon, Tag } from 'antd'
import explorerLogic from 'scenes/explorer/logic'
import naturalCompare from 'string-natural-compare'

const icons = {
  column: 'tag',
  link: 'link',
  custom: 'form'
}

const columnIcon = {
  number: 'number',
  time: 'clock-circle',
  string: 'font-size'
}

const arrayToObjectKeys = (arr, defaultValue) => {
  let obj = {}
  arr.forEach(a => obj[a] = defaultValue)
  return obj
}

const getAllFields = (structure) => {
  let allFields = []

  Object.values(structure).forEach(model => {
    allFields = [
      ...allFields,
      model.model,
      ...Object.keys(model.columns).map(column => `${model.model}.${column}`),
      ...Object.keys(model.links).map(link => `${model.model}.${link}`),
      ...Object.keys(model.custom).map(key => `${model.model}.${key}`)
    ]
  })

  return allFields
}

const logic = kea({
  connect: {
    values: [
      explorerLogic, ['structure']
    ]
  },

  actions: () => ({
    setCheckedKeys: (checkedKeys) => ({ checkedKeys })
  }),

  reducers: ({ actions, selectors }) => ({
    checkedKeys: [state => selectors.structure(state) ? getAllFields(selectors.structure(state)) : [], {
      [actions.setCheckedKeys]: (_, payload) => payload.checkedKeys
    }]
  }),

  selectors: ({ selectors }) => ({
    sortedModels: [
      () => [selectors.structure],
      structure => Object.keys(structure).sort()
    ],
    sortedStructure: [
      () => [selectors.structure],
      (structure) => {
        const newStructure = {}
        Object.entries(structure).forEach(([model, { custom, columns, links }]) => {
          newStructure[model] = [
            ...Object.entries(custom).map(([key, meta]) => ({ key, type: 'custom', meta })),
            ...Object.entries(columns).map(([key, meta]) => ({ key, type: 'column', meta })),
            ...Object.entries(links).map(([key, meta]) => ({ key, type: 'link', meta }))
          ].sort((a, b) => naturalCompare(a.key, b.key))
        })
        return newStructure
      }
    ],
    checkedKeysLookup: [
      () => [selectors.checkedKeys],
      (checkedKeys) => arrayToObjectKeys(checkedKeys)
    ],
    checkedModelsLookup: [
      () => [selectors.structure, selectors.checkedKeys],
      (structure, checkedKeys) => {
        const models = {}
        checkedKeys.forEach(key => models[key.split('.')[0]] = true)
        return models
      }
    ]
  })
})

const RenderNodeTitle = memo(({ model, field }) => {
  return (
    <div className='tree-column-row'>
      <span className='column-key'>
        {field.key}
        {field.meta.index === 'primary_key' ? <Icon type="idcard" title='Primary Key' /> : ''}
      </span>
      <div className='column-meta'>
        {field.type === 'link' ? (
          <Tag color='geekblue'>
            <Icon type="link" /> {field.meta.model} <Icon type="ellipsis" /> {field.meta.model_key}
          </Tag>
        ) : field.type === 'column' ? (
          <Tag color='orange'>
            <Icon type={columnIcon[field.meta.type] || 'tag'} /> {field.meta.type}
          </Tag>
        ) : field.type === 'custom' ? (
          <Tag color='green'>
            <Icon type='code' /> {field.meta.sql}
          </Tag>
        ) : null}
        <Icon type='edit' onClick={() => { console.log('clicked')}}  />
      </div>
    </div>
  )
})

export default function Models () {
  const { sortedModels, sortedStructure, checkedModelsLookup, checkedKeys } = useValues(logic)
  const { setCheckedKeys } = useActions(logic)

  return (
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
          title={model}
        >
          {sortedStructure[model].map(field => (
            <Tree.TreeNode
              disabled={field.type === 'link' && !checkedModelsLookup[field.meta.model]}
              switcherIcon={<Icon type={icons[field.type]} />}
              key={`${model}.${field.key}`}
              title={<RenderNodeTitle model={model} field={field} />}
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
  )
}
