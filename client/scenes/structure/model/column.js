import React, { Component, PropTypes } from 'react'
import Select from 'lib/forms/select'

const groupTypes = ['column', 'custom', 'link']
const columnTypes = ['unknown', 'number', 'string', 'boolean', 'time', 'date']
const indexTypes = ['', 'primary_key']
const otherMetaFields = {
  column: ['type', 'index', 'url'],
  link: ['my_key', 'model', 'model_key'],
  custom: ['sql', 'type', 'url']
}

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
      editing: false
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

  handleMetaChange = (value, metaKey) => {
    const { model, column, columnMeta, addChange } = this.props

    addChange(model, column, metaKey, value, columnMeta[metaKey])
  }

  handleDiscardChanges = () => {
    const { model, column, discardChanges } = this.props
    discardChanges(model, column)
    this.setState({ editing: false })
  }

  renderMetaEdit = (field, value) => {
    const { models, column } = this.props

    if (field === 'type') {
      return <Select value={value} options={columnTypes} onValueChange={val => this.handleMetaChange(val, 'type')} />
    } else if (field === 'model') {
      return <Select value={value} options={models} onValueChange={val => this.handleMetaChange(val, 'model')} />
    } else if (field === 'index') {
      return <Select value={value} options={indexTypes} onValueChange={val => this.handleMetaChange(val, 'inex')} />
    } else {
      const placeholder = field === 'url' ? `https://mysite.com/admin/?${column}={${column}}` : ''
      return (
        <input
          type='text'
          className='input-text meta-input'
          placeholder={placeholder}
          value={value}
          onChange={e => this.handleMetaChange(e.target.value, field)} />
      )
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
          <td style={{verticalAlign: 'top'}}>
            {meta.disabled
              ? <span className='column-label'>{column}</span>
              : <input type='text' className='input-text column-name' value={column} />}
            <br />
            <div style={{marginTop: 5}}>
              <label style={{display: 'inline-block'}}>
                <input type='checkbox' checked={!meta.disabled} onChange={this.handleToggleDisable} />
                {' '}
                Enabled?
              </label>
            </div>
            <div style={{marginTop: 5}}>
              <button type='button' onClick={() => this.setState({ editing: false })}>Save</button>
              {' '}
              {metaChanges
                ? <button className='white' type='button' onClick={this.handleDiscardChanges}>Discard</button>
                : null}
            </div>
          </td>
        ) : (
          <td className='no-wrap'>
            <span className='column-label'>{column}</span>
            {' '}
            <span className='edit-link' onClick={() => this.setState({ editing: true })}>(edit)</span>
          </td>
        )}
        {meta.disabled || !editing ? (
          <td>
            <span className={`column-group ${meta.group}`}>{meta.group}</span>
          </td>
        ) : (
          <td style={{verticalAlign: 'top'}}>
            <Select
              value={meta.group}
              options={groupTypes}
              onValueChange={val => this.handleMetaChange(val, 'group')}
              style={{width: 80}} />
          </td>
        )}
        {meta.disabled || !editing ? (
          <td>
            {otherMetaFields[meta.group].filter(metaField => meta[metaField]).map(metaField => (
              <span key={metaField} className={`meta-field${hasChanged && metaChanges[metaField] ? ' changed-field' : ''}`}>
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
                <span className={`meta-field${hasChanged && metaChanges[metaField] ? ' changed-field' : ''}`}>
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
