import React, { Component, PropTypes } from 'react'
import Select from 'lib/forms/select'

const columnTypes = ['unknown', 'number', 'string', 'boolean', 'time', 'date']
const otherMetaFields = ['index', 'url']

export default class ModelColumn extends Component {
  static PropTypes = {
    column: PropTypes.string,
    columnMeta: PropTypes.object
  }

  render () {
    const { column, columnMeta } = this.props

    return (
      <tr>
        <td>
          <input type='checkbox' checked />
        </td>
        <td>{column}</td>
        <td>
          <Select value={columnMeta.type} options={columnTypes} onValueChange={() => {}} />
        </td>
        <td>
          {otherMetaFields.map(metaField => (
            <span key={metaField}>
              <label>
                <input type='checkbox' checked={columnMeta[metaField] !== undefined} />
                {' '}
                {metaField}
              </label>
              {columnMeta[metaField] !== undefined
                ? metaField === 'url'
                  ? <input type='text' value={columnMeta[metaField]} />
                  : metaField === 'index'
                    ? <input type='text' value={columnMeta[metaField]} />
                    : null
                : null}
            </span>
          ))}
        </td>
      </tr>
    )
  }
}
