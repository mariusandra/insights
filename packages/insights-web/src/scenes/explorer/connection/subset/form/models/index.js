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
  if (field.type === 'link') {
    return (
      <div className='tree-column-row'>
        <span className='column-key'>{field.key}</span>
        <Tag color='geekblue'>
          <Icon type="link" /> {field.meta.model} <Icon type="ellipsis" /> {field.meta.model_key}
        </Tag>
      </div>
    )
  } else if (field.type === 'column') {
    return (
      <div className='tree-column-row'>
        <span className='column-key'>{field.key}</span>
        <Tag color='orange'>
          <Icon type={columnIcon[field.meta.type] || 'tag'} /> {field.meta.type}
        </Tag>
      </div>
    )
  } else if (field.type === 'custom') {
    return (
      <div className='tree-column-row'>
        <span className='column-key'>{field.key}</span>
        <Tag color='green'>
          <Icon type='code' /> {field.meta.sql}
        </Tag>
      </div>
    )
  } else {
    return field.key
  }
})

export default function Models () {
  const { structure } = useValues(explorerLogic)
  const { sortedStructure, checkedModelsLookup } = useValues(logic)

  const { checkedKeys } = useValues(logic)
  const { setCheckedKeys } = useActions(logic)

  return (
    <Tree
      selectable={false}
      showLine
      switcherIcon={<Icon type="down" />}
      blockNode
      checkable
      checkedKeys={checkedKeys}
      onCheck={setCheckedKeys}
      className='models-select-tree'
    >
      {Object.keys(sortedStructure).map(model => (
        <Tree.TreeNode
          key={model}
          showLine
          title={model}
        >
          {sortedStructure[model].map(field => (
            <Tree.TreeNode
              disableCheckbox={field.type === 'link' && !checkedModelsLookup[field.meta.model]}
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
