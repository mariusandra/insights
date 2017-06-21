// libraries
import React, { PropTypes, Component } from 'react'

// utils

// components
import Column from './column'

export default class StructureModel extends Component {
  static propTypes = {
    model: PropTypes.string,
    modelStructure: PropTypes.object
  }

  render () {
    const { model, modelStructure } = this.props

    const allColumns = Object.keys(modelStructure.columns).sort((a, b) => a.localeCompare(b))
    const fkColumns = allColumns.filter(c => modelStructure.columns[c].index)
    const otherColumns = allColumns.filter(c => !modelStructure.columns[c].index)
    const columns = fkColumns.concat(otherColumns)

    const customs = Object.keys(modelStructure.custom).sort((a, b) => a.localeCompare(b))
    const links = Object.keys(modelStructure.links).sort((a, b) => a.localeCompare(b))

    return (
      <div>
        {columns.length > 0 ? (
          <div style={{paddingBottom: 10}}>
            <strong>Columns ({columns.length})</strong>
            <table className='structure-table'>
              <thead>
                <tr>
                  <th>Enabled?</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Misc</th>
                </tr>
              </thead>
              <tbody>
                {columns.map(column => <Column key={column} column={column} columnMeta={modelStructure.columns[column]} />)}
              </tbody>
            </table>
          </div>
        ) : null}
        <div style={{paddingBottom: 10}}>
          <strong>Customs ({customs.length})</strong>
          <br />
          {customs.map(custom => (
            <div key={custom}>
              {custom}
              {' - '}
              <small style={{color: '#888'}}>
                {Object.values(modelStructure.custom[custom]).join(', ')}
              </small>
            </div>
          ))}
          <a href='#'>+ Add</a>
        </div>
        {links.length > 0 ? (
          <div style={{paddingBottom: 10}}>
            <strong>Links ({links.length})</strong>
            <br />
            {links.map(link => (
              <div key={link}>
                {link}
                {' - '}
                <small style={{color: '#888'}}>
                  {Object.values(modelStructure.links[link]).join(', ')}
                </small>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    )
  }
}
