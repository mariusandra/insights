import React, { Component, PropTypes } from 'react'
import Select from 'lib/forms/select'

const columnTypes = ['unknown', 'number', 'string', 'boolean', 'time', 'date']
const otherMetaFields = ['index', 'url']

export default class ModelColumn extends Component {
  static PropTypes = {
    model: PropTypes.string,
    column: PropTypes.string,
    columnMeta: PropTypes.any,
    metaChanges: PropTypes.object,
    addChange: PropTypes.func
  }

  getOriginalMeta = () => {
    const { columnMeta } = this.props

    if (columnMeta === false) {
      return { disabled: true }
    } else {
      return Object.assign({ disabled: false }, columnMeta)
    }
  }

  getMeta = () => {
    const { metaChanges } = this.props

    const meta = this.getOriginalMeta()

    if (metaChanges) {
      return Object.assign({}, meta, metaChanges)
    }

    return meta
  }

  handleToggleDisable = () => {
    const { model, column, addChange } = this.props
    const meta = this.getMeta()
    const originalMeta = this.getOriginalMeta()

    addChange(model, 'columns', column, 'disabled', !meta.disabled, originalMeta.disabled)
  }

  handleTypeChange = (type) => {
    const { model, column, addChange } = this.props
    const originalMeta = this.getOriginalMeta()

    addChange(model, 'columns', column, 'type', type, originalMeta.type)
  }

  render () {
    const { metaChanges } = this.props
    const { column } = this.props

    const meta = this.getMeta()

    const hasChanged = metaChanges && Object.keys(metaChanges).length > 0

    return (
      <tr className={`${meta.disabled ? 'disabled ' : ''}${hasChanged ? 'changed ' : ''}`}>
        <td>
          <input type='checkbox' checked={!meta.disabled} onChange={this.handleToggleDisable} />
        </td>
        <td>{column}</td>
        <td>
          {!meta.disabled ? <Select value={meta.type} options={columnTypes} onValueChange={(value) => this.handleTypeChange(value)} /> : null}
        </td>
        <td>
          {!meta.disabled ? otherMetaFields.map(metaField => (
            <span key={metaField}>
              <label>
                <input type='checkbox' checked={meta[metaField] !== undefined} />
                {' '}
                {metaField}
              </label>
              {meta[metaField] !== undefined
                ? metaField === 'url'
                  ? <input type='text' value={meta[metaField]} />
                  : metaField === 'index'
                    ? <input type='text' value={meta[metaField]} />
                    : null
                : null}
            </span>
          )) : null}
        </td>
      </tr>
    )
  }
}
