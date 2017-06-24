import React, { Component, PropTypes } from 'react'
import Select from 'lib/forms/select'

const groupTypes = ['column', 'custom', 'link']
const columnTypes = ['unknown', 'number', 'string', 'boolean', 'time', 'date']
const indexTypes = ['', 'primary_key']
const otherMetaFields = {
  column: ['type', 'index', 'url'],
  link: ['model', 'model_key', 'my_key'],
  custom: ['type', 'sql', 'url']
}

export default class ModelColumn extends Component {
  static PropTypes = {
    model: PropTypes.string,
    models: PropTypes.array,
    column: PropTypes.string,
    columnMeta: PropTypes.any,
    metaChanges: PropTypes.object,
    addChange: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {
      editing: false
    }
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

    addChange(model, column, 'disabled', !meta.disabled, originalMeta.disabled)
  }

  handleTypeChange = (type) => {
    const { model, column, addChange } = this.props
    const originalMeta = this.getOriginalMeta()

    addChange(model, column, 'type', type, originalMeta.type)
  }

  renderMetaEdit = (field, value) => {
    const { models, column } = this.props

    if (field === 'type') {
      return <Select value={value} options={columnTypes} />
    } else if (field === 'model') {
      return <Select value={value} options={models} />
    } else if (field === 'index') {
      return <Select value={value} options={indexTypes} />
    } else {
      const placeholder = field === 'url' ? `https://mysite.com/admin/?${column}={${column}}` : ''
      return <input type='text' className='input-text meta-input' placeholder={placeholder} value={value} />
    }
  }

  render () {
    const { metaChanges, column } = this.props
    const { editing } = this.state

    const meta = this.getMeta()

    const hasChanged = metaChanges && Object.keys(metaChanges).length > 0

    return (
      <tr className={`${meta.disabled ? 'disabled ' : ''}${hasChanged ? 'changed ' : ''}`}>
        {editing ? (
          <td className='no-wrap'>
            <input type='checkbox' checked={!meta.disabled} onChange={this.handleToggleDisable} />
            {' '}
            {meta.disabled ? column : <input type='text' className='input-text column-name' value={column} />}
          </td>
        ) : (
          <td className='no-wrap'>
            {column}
            {' '}
            <span className='edit-link' onClick={() => this.setState({ editing: true })}>(edit)</span>
          </td>
        )}
        {meta.disabled || !editing ? (
          <td>
            <span className={`column-group ${meta.group}`}>{meta.group}</span>
          </td>
        ) : (
          <td>
            <Select value={meta.group} options={groupTypes} />
          </td>
        )}
        {meta.disabled || !editing ? (
          <td>
            {otherMetaFields[meta.group].filter(metaField => meta[metaField]).map(metaField => (
              <span key={metaField} className='meta-field'>
                <span className='label'>
                  {metaField.split('_').join(' ')}:
                </span>
                {meta[metaField]}
              </span>
            ))}
          </td>
        ) : (
          <td>
            {otherMetaFields[meta.group].map(metaField => (
              <div key={metaField}>
                <span className='meta-field'>
                  <span className='label'>
                    {metaField.split('_').join(' ')}{meta[metaField] !== undefined ? ':' : ''}
                  </span>
                  {this.renderMetaEdit(metaField, meta[metaField])}
                </span>
              </div>
            ))}
          </td>
        )}
      </tr>
    )
  }
}
