import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Select from 'lib/forms/select'

const groupTypes = ['column', 'custom', 'link']
const columnTypes = ['unknown', 'number', 'string', 'boolean', 'time', 'date']
const indexTypes = ['', 'primary_key']
const otherMetaFields = {
  column: ['type', 'index', 'url'],
  link: ['my_key', 'model', 'model_key'],
  custom: ['sql', 'type', 'url']
}

const noop = () => {}

export default class ModelColumn extends Component {
  static PropTypes = {
    model: PropTypes.string,
    models: PropTypes.array,
    column: PropTypes.string,
    columnMeta: PropTypes.object,
    metaChanges: PropTypes.object,
    addChange: PropTypes.func,
    discardChanges: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {
      editing: {}
    }
  }

  getMeta = () => {
    const { columnMeta, metaChanges } = this.props

    return metaChanges ? Object.assign({}, columnMeta, metaChanges) : columnMeta
  }

  handleToggleDisable = () => {
    const { model, column, columnMeta, addChange } = this.props
    const meta = this.getMeta()

    addChange(model, column, 'disabled', !meta.disabled, columnMeta.disabled)
  }

  handleMetaChange = (value, field, close = false) => {
    const { model, column, columnMeta, addChange } = this.props

    addChange(model, column, field, value, columnMeta[field])

    if (close) {
      this.clearEditing(field)
    }
  }

  handleDiscardChanges = () => {
    const { model, column, discardChanges } = this.props
    discardChanges(model, column)
    this.setState({ editing: {} })
  }

  renderMetaEdit = (field, value) => {
    const { models, column } = this.props

    if (field === 'type') {
      return <Select value={value} options={columnTypes} onValueChange={val => this.handleMetaChange(val, 'type', true)} />
    } else if (field === 'model') {
      return <Select value={value} options={models} onValueChange={val => this.handleMetaChange(val, 'model', true)} />
    } else if (field === 'index') {
      return <Select value={value} options={indexTypes} onValueChange={val => this.handleMetaChange(val, 'inex', true)} />
    } else {
      const placeholder = field === 'url' ? `https://mysite.com/admin/?${column}={${column}}` : ''
      return (
        <input
          autoFocus
          type='text'
          className='input-text meta-input'
          placeholder={placeholder}
          value={value}
          onBlur={() => this.clearEditing(field)}
          onChange={e => this.handleMetaChange(e.target.value, field)} />
      )
    }
  }

  renderMetaShow = (field, value) => {
    return value
  }

  setEditing = (field) => {
    const { editing } = this.state
    const meta = this.getMeta()

    this.setState({
      editing: {
        ...editing,
        [field]: true
      }
    })

    if (meta[field] === undefined) {
      this.handleMetaChange('', field)
    }
  }

  clearEditing = (field) => {
    const { editing } = this.state
    const meta = this.getMeta()

    this.setState({
      editing: {
        ...editing,
        [field]: false
      }
    })

    if (meta[field] === '') {
      this.handleMetaChange(undefined, field)
    }
  }

  render () {
    const { metaChanges, column } = this.props
    const { editing } = this.state

    const meta = this.getMeta()

    const hasChanged = metaChanges && Object.keys(metaChanges).length > 0

    return (
      <tr className={`${meta.disabled ? 'disabled ' : ''}${hasChanged ? 'changed ' : ''}`}>
        <td>
          {meta.disabled || !editing.column
            ? <span className='column-label' onClick={() => this.setEditing('column')}>{column}</span>
            : <input autoFocus type='text' onBlur={() => this.clearEditing('column')} className='input-text column-name' value={column} />}
          {' '}
          {hasChanged
            ? <span className='tag discard' onClick={this.handleDiscardChanges}>Discard</span>
            : null}
        </td>
        <td>
          <span className={meta.disabled ? 'tag disabled' : 'tag enabled'} onClick={this.handleToggleDisable}>
            {meta.disabled ? 'Disabled' : 'Enabled'}
          </span>
        </td>
        <td>
          {meta.disabled || !editing.group
            ? <span className={`tag ${meta.group}`} onClick={() => this.setEditing('group')}>{meta.group}</span>
            : (
              <Select
                value={meta.group}
                options={groupTypes}
                onBlur={() => this.clearEditing('group')}
                onValueChange={val => this.handleMetaChange(val, 'group', true)}
                style={{width: 80}} />
            )}
        </td>
        {!meta.disabled ? (
          <td>
            {otherMetaFields[meta.group].filter(metaField => meta[metaField] !== undefined).map(metaField => (
              <div key={metaField} className={`meta-field-container${editing[metaField] ? ' editing' : ' showing'}`}>
                <span
                  className={`meta-field${hasChanged && metaChanges[metaField] ? ' changed-field' : ''}`}
                  onClick={!editing[metaField] ? () => { this.setEditing(metaField) } : noop}>
                  <span className='label'>
                    {metaField.split('_').join(' ')}:
                  </span>
                  {editing[metaField]
                    ? this.renderMetaEdit(metaField, meta[metaField])
                    : this.renderMetaShow(metaField, meta[metaField])}
                </span>
              </div>
            ))}
            {otherMetaFields[meta.group].filter(metaField => meta[metaField] === undefined).map(metaField => (
              <div key={metaField} className='meta-field-container empty'>
                <span className={`meta-field${hasChanged && metaChanges[metaField] ? ' changed-field' : ''}`}
                  onClick={() => { this.setEditing(metaField) }}>
                  <span className='label no-field'>
                    {metaField.split('_').join(' ')}
                  </span>
                </span>
              </div>
            ))}
          </td>
        ) : (
          <td />
        )}
      </tr>
    )
  }
}
