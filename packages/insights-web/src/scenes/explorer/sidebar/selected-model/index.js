import React from 'react'
import { useActions, useValues } from 'kea'

import { Button, Tree, Icon } from 'antd'

import { columnIcon } from '../../connection/subset/form/models/edit-field'

import explorerLogic from 'scenes/explorer/logic'
import { useSelector } from 'react-redux'
import locationSelector from 'lib/selectors/location'
import HighlightText from 'lib/utils/highlight-text'
import Pin from './pin'
import FilterButton from './filter-button'

const { TreeNode } = Tree;

function renderTreeNodes ({ treeNode, title, columns, path, field, localSearch, model, focusSearch, sortedStructure, treeState, fieldClicked }) {
  const fieldPath = path.indexOf('...pinned.') === 0 ? path.substring('...pinned.'.length) : path
  const isSelected = treeNode && treeNode.isSelected

  let titleToUse = title
  if (treeNode && treeNode.isIdCountField) {
    titleToUse = `count`
  }

  const titleComponent = field
    ? (
      <div className={`sidebar-field-title sidebar-field-type-${field.type}`}>
        <span className={`field-title${isSelected ? ' field-selected' : ''}${treeNode && treeNode.isIdCountField ? ' id-count-field' : ''}`} onClick={() => fieldClicked(field, path)}>
          {localSearch ? <HighlightText highlight={localSearch}>{titleToUse}</HighlightText> : titleToUse}
        </span>
        {' '}
        {field.type === 'link' ? (
          <span className='model-link-tag'><Icon type='link' /> {field.meta.model}</span>
        ) : !(treeNode && treeNode.isIdCountField) ? (
          <span className='model-field-controls'>
            <Pin path={fieldPath} />
            <FilterButton path={path} />
          </span>
        ) : (
          <span />
        )}
      </div>
    ) : (
      <strong>{model}</strong>
    )

  return (
    <TreeNode key={path}
              isLeaf={field && field.type !== 'link'}
              title={titleComponent}
              className={`tree-node${isSelected ? ' tree-node-selected' : ''}${field ? ` field-type-${field.type}` : ''}`}
              switcherIcon={field && field.type !== 'link' ? <Icon type={field.meta ? (treeNode && treeNode.isIdCountField ? 'ordered-list' : field.meta.index === 'primary_key' ? 'idcard' : (columnIcon[field.meta.type] || 'question-circle')) : 'question-circle'} /> : null}>
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
  const { columns, sortedStructure, selectedModel, selectedModelViews, modelFavourites, search, treeState, expandedKeys, selectedKey, fullFieldsTree } = useValues(explorerLogic)
  const { closeModel, focusSearch, treeClicked, fieldClicked, setExpandedKeys } = useActions(explorerLogic)

  const { pathname: urlPath, search: urlSearch } = useSelector(locationSelector)

  const url = urlPath + urlSearch

  const [viewNode, pinnedNode, fieldNode] = fullFieldsTree.children

  return (
    <div>
      <div>
        <Button type='link' icon='home' style={{float: 'right'}} onClick={() => closeModel(selectedModel)} />
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
        onSelect={(([key]) => treeClicked(key || selectedKey))}
      >
        <TreeNode
          title={
            <>
              {selectedModelViews.length === 0 ? <span>Saved views </span> : <strong>Saved views </strong>}
              <small>({ selectedModelViews.length })</small>
            </>
          }
          className='saved-views'
          key="...saved"
          switcherIcon={<Icon type='star' theme={selectedModelViews.length > 0 ? "filled" : ''} />}
        >
          {viewNode.children.map(({ view, key }) => key === 'SAVE_NEW' ? (
            <TreeNode
              key={`...saved.SAVE_NEW`}
              title={<span className='save-new-view'>Save this view</span>}
              switcherIcon={<Icon type="plus" />}
            />
          ) : (
            <TreeNode
              key={`...saved.${view._id}`}
              title={url === view.path ? <strong>{view.name}</strong> : view.name}
              switcherIcon={<Icon type="star" />}
            />
          ))}
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
          {pinnedNode.children.map(({ field, localPath }) => {
            const [, ...rest] = localPath.split('.')
            return renderTreeNodes({
              field,
              title: rest.join('.'),
              path: `...pinned.${localPath}`,
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
          treeNode: fieldNode
        })] : []}
      </Tree>
    </div>
  )
}
