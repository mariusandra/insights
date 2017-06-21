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

  constructor (props) {
    super(props)

    this.state = {
      expanded: false
    }
  }

  handleExpand = (e) => {
    e.preventDefault()
    this.setState({
      expanded: !this.state.expanded
    })
  }

  render () {
    const { model, modelStructure } = this.props
    const { expanded } = this.state

    const allColumns = Object.keys(modelStructure.columns).sort((a, b) => a.localeCompare(b))
    const fkColumns = allColumns.filter(c => modelStructure.columns[c].index)
    const otherColumns = allColumns.filter(c => !modelStructure.columns[c].index)
    const columns = fkColumns.concat(otherColumns)

    const customs = Object.keys(modelStructure.custom).sort((a, b) => a.localeCompare(b))
    const links = Object.keys(modelStructure.links).sort((a, b) => a.localeCompare(b))

    return (
      <div>
        <span onClick={this.handleExpand} style={{cursor: 'pointer'}}>
          <i className={expanded ? 'fa fa-arrow-down' : 'fa fa-arrow-right'} />
          &nbsp;
          {model}
        </span>
        {expanded ? (
          <div style={{paddingLeft: 20, paddingTop: 10}}>
            {columns.length > 0 ? (
              <div style={{paddingBottom: 10}}>
                <strong>Columns:</strong>
                <br />
                <table>
                  <thead>
                    <th>Enabled?</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Misc</th>
                  </thead>
                  <tbody>
                    {columns.map(column => <Column key={column} column={column} columnMeta={modelStructure.columns[column]} />)}
                  </tbody>
                </table>
              </div>
            ) : null}
            <div style={{paddingBottom: 10}}>
              <strong>Customs:</strong>
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
                <strong>Links:</strong>
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
        ) : null}
      </div>
    )
  }
}
