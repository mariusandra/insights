import './styles.scss'

import React from 'react'
import { useActions, useValues } from 'kea'
import { Tree, Icon, Button } from 'antd'
import EditField, { fieldIcon } from './edit-field'

import ModelRow from './model-row'
import FieldRow from './field-row'

import logic from './logic'

export default function Models () {
  const {
    sortedModels,
    structure,
    sortedStructure,
    checkedModelsLookup,
    checkedKeys,
    editingFieldType,
    ignoredColumnCount,
    editedColumnCount,
    addedColumnCount
  } = useValues(logic)
  const { setCheckedKeysRaw, addCustomField, editField, closeEdit, toggle } = useActions(logic)

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
            title={
              <ModelRow
                model={model}
                ignoredColumnCount={ignoredColumnCount[model] || 0}
                editedColumnCount={editedColumnCount[model] || 0}
                addedColumnCount={addedColumnCount[model] || 0}
                sortedStructure={sortedStructure}
              />
            }
          >
            {sortedStructure[model].map(field => (
              <Tree.TreeNode
                disabled={field.type === 'link' && !checkedModelsLookup[field.meta.model]}
                switcherIcon={<Icon type={fieldIcon[field.type]} />}
                key={`${model}.${field.key}`}
                title={<FieldRow structure={structure} model={model} field={field} editField={editField} />}
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

      <EditField visible={!!editingFieldType} closeEdit={closeEdit} />
    </div>
  )
}
