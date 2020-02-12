import React from 'react'
import { useActions, useValues } from 'kea'

import { Button, Tree, Icon } from 'antd'

import { columnIcon } from '../../connection/subset/form/models/edit-field'

import explorerLogic from 'scenes/explorer/logic'
import { useSelector } from 'react-redux'
import locationSelector from 'lib/selectors/location'
import HighlightText from 'lib/utils/highlight-text'
import FavouriteStar from './favourite-star'
import FilterButton from './filter-button'
import { getSortedMeta } from '../../../../lib/explorer/get-sorted-meta'

const { TreeNode } = Tree;

const stringIn = (search, string) => {
  let i = 0
  const s = search.toLowerCase()
  string.toLowerCase().split('').forEach(letter => {
    if (i < s.length && s[i] === letter) {
      i++
    }
  })
  return i >= s.length
}

function stringInFieldKey (search, path) {
  const [, ...rest] = path.split('.')
  return stringIn(search, rest.join('.'))
}

function renderTreeNodes ({ title, columns, path, field, localSearch, model, focusSearch, sortedStructure, treeState, fieldClicked, treeNode }) {
  const isSelected = columns.includes(path) || columns.some(s => s.indexOf(`${path}.`) >= 0) || columns.some(s => s.indexOf(`${path}!`) >= 0)

  const titleComponent = field
    ? (
      <div className={`sidebar-field-title sidebar-field-type-${field.type}`}>
        <span className={`field-title${isSelected ? ' field-selected' : ''}`} onClick={() => fieldClicked(field, path)}>
          {localSearch ? <HighlightText highlight={localSearch}>{title}</HighlightText> : title}
        </span>
        {' '}
        {field.type === 'link' ? (
          <span className='model-link-tag'><Icon type='link' /> {field.meta.model}</span>
        ) : (
          <span className='model-field-controls'>
            <FavouriteStar path={path} />
            <FilterButton path={path} />
          </span>
        )}
      </div>
    ) : <strong>{model}</strong>

  return (
    <TreeNode key={path}
              isLeaf={field && field.type !== 'link'}
              title={titleComponent}
              className={`tree-node${isSelected ? ' tree-node-selected' : ''}${field ? ` field-type-${field.type}` : ''}`}
              switcherIcon={field && field.type !== 'link' ? <Icon type={field.meta ? (field.meta.index === 'primary_key' ? 'idcard' : (columnIcon[field.meta.type] || 'question-circle')) : 'question-circle'} /> : null}>
      {treeNode && treeNode.children.map(child => {
        const { field } = child
        return renderTreeNodes({
          path: `${path}.${field.key}`,
          field: field,
          model: field.meta && field.meta.model,
          localSearch: localSearch.split(' ').slice(1).join(' '),
          title: field.key,
          focusSearch: focusSearch,
          sortedStructure,
          fieldClicked,
          columns,
          treeState,
          treeNode: child
        })
      })}
    </TreeNode>
  )
}

export default function SelectedModel () {
  const { columns, sortedStructure, sortedStructureObject, selectedModel, savedViews, modelFavourites, search, treeState, expandedKeys, selectedKey, fullFieldsTree } = useValues(explorerLogic)
  const { closeModel, focusSearch, treeClicked, fieldClicked, setExpandedKeys } = useActions(explorerLogic)

  const { pathname: urlPath, search: urlSearch } = useSelector(locationSelector)

  const url = urlPath + urlSearch

  return (
    <div>
      <div>
        <Button type='link' icon='close' style={{float: 'right'}} onClick={closeModel} />
        <h4 style={{ lineHeight: '30px', fontSize: 18, fontWeight: 'bold' }}>{selectedModel}</h4>
      </div>

      <Tree
        showIcon
        blockNode
        switcherIcon={<Icon type="down" />}
        expandedKeys={expandedKeys}
        onExpand={setExpandedKeys}
        selectable
        selectedKeys={[selectedKey]}
        onSelect={(([key]) => treeClicked(key))}
      >
        <TreeNode
          title={
            <>
              {savedViews.length === 0 ? <span>Saved views </span> : <strong>Saved views </strong>}
              <small>({ savedViews.length })</small>
            </>
          }
          className='saved-views'
          key="...saved"
          switcherIcon={<Icon type='star' theme={savedViews.length > 0 ? "filled" : ''} />}
        >
          {savedViews.filter(view => !search || stringInFieldKey(search, view.name)).map(view => (
            <TreeNode
              key={`...saved.${view._id}`}
              title={url === view.path ? <strong>{view.name}</strong> : view.name}
              switcherIcon={<Icon type="star" />}
            />
          ))}
          <TreeNode
            key={`...saved.SAVE_NEW`}
            title={<span className='save-new-view'>Save this view</span>}
            switcherIcon={<Icon type="plus" />}
          />
        </TreeNode>

        <TreeNode
          title={
            <>
            {modelFavourites.length === 0 ? <span>Pinned Fields </span> : <strong>Pinned Fields </strong>}
             <small>({ modelFavourites.length })</small>
            </>
          }
          className='pinned-keys'
          key="...pinned"
          switcherIcon={<Icon type='pushpin' theme={modelFavourites.length > 0 ? "filled" : ''} />}
        >
          {modelFavourites.filter(path => !search || stringInFieldKey(search, path)).map(path => {
            const field = getSortedMeta(path, sortedStructureObject)
            const [, ...rest] = path.split('.')
            return renderTreeNodes({
              field,
              title: rest.join('.'),
              path: path,
              localSearch: search,
              model: field && field.meta ? field.meta.model : '',
              focusSearch,
              sortedStructure,
              fieldClicked,
              columns,
              treeState
            })
          })}
        </TreeNode>

        {sortedStructure[selectedModel] ? [renderTreeNodes({
          title: selectedModel,
          path: selectedModel,
          localSearch: ' ' + search,
          model: selectedModel,
          focusSearch,
          sortedStructure,
          fieldClicked,
          columns,
          treeState,
          treeNode: fullFieldsTree
        })] : []}
      </Tree>
    </div>
  )
}
