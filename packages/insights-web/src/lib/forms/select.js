import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Select extends Component {
  static propTypes = {
    value: PropTypes.any,
    name: PropTypes.string,
    autoFocus: PropTypes.bool,
    multiple: PropTypes.bool,
    disabled: PropTypes.bool,
    options: PropTypes.array,
    style: PropTypes.object,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    onValueChange: PropTypes.func
  };

  handleChange = (e) => {
    if (this.props.onChange) {
      this.props.onChange(e)
    }
    if (this.props.onValueChange) {
      this.props.onValueChange(e.target.value)
    }
  }

  handleBlur = (e) => {
    if (this.props.onBlur) {
      this.props.onBlur(e)
    }
  }

  render () {
    const { name, value, multiple, options, disabled, placeholder, style, autoFocus } = this.props

    return (
      <div className={`super-select${placeholder && !value ? ' placeholder' : ''}`} style={style}>
        <select ref='field' name={name} className='inline' autoFocus={!!autoFocus} multiple={!!multiple} disabled={disabled} value={value} onChange={this.handleChange} onBlur={this.handleBlur}>
          {placeholder ? <option value=''>{placeholder}</option> : null}
          {options.map(option => (
            (typeof option === 'string' || typeof option === 'number')
              ? <option key={option} value={option}>{option}</option>
              : <option key={option._id || option.id} value={option._id || option.id}>{option.name}</option>
          ))}
        </select>
        <div className='arrow'>▾</div>
      </div>
    )
  }
}
