import React, { Component } from 'react'
import { connect } from 'kea'

import Column from './column'

import structure from 'scenes/structure/logic'

const logic = connect({
  actions: [
    structure, [
      'addChange',
      'discardChanges'
    ]
  ],
  props: [
    structure, [
      'models',
      'combinedStructure',
      'structure',
      'structureChanges',
      'selectedModel'
    ]
  ]
})

class StructureModel extends Component {
  getStructure = () => {
    const { combinedStructure, selectedModel } = this.props
    return combinedStructure[selectedModel]
  }

  render () {
    const { selectedModel, structureChanges, models } = this.props
    const { addChange, discardChanges } = this.props.actions

    const modelStructure = this.getStructure()

    const allColumns = Object.keys(modelStructure).sort((a, b) => a.localeCompare(b))

    const fkColumns = allColumns.filter(c => modelStructure[c].group === 'column' && modelStructure[c].index)
    const otherColumns = allColumns.filter(c => !(modelStructure[c].group === 'column' && modelStructure[c].index))

    const columns = fkColumns.sort((a, b) => a.localeCompare(b)).concat(otherColumns.sort((a, b) => a.localeCompare(b)))

    return (
      <div>
        {columns.length > 0 ? (
          <div style={{paddingBottom: 10}}>
            <strong>{columns.length} column{columns.length === 1 ? '' : 's'}</strong>
            <table className='structure-table'>
              <tbody>
                {columns.map(column => (
                  <Column
                    key={column}
                    model={selectedModel}
                    models={models}
                    column={column}
                    columnMeta={modelStructure[column]}
                    metaChanges={(structureChanges[selectedModel] || {})[column]}
                    addChange={addChange}
                    discardChanges={discardChanges} />
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    )
  }
}

export default logic(StructureModel)
