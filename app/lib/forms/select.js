/* global window */
import React, { Component, PropTypes } from 'react'

export default class Radio extends Component {
  static propTypes = {
    value: PropTypes.any,
    name: PropTypes.string,
    multiple: PropTypes.bool,
    disabled: PropTypes.bool,
    options: PropTypes.array,
    style: PropTypes.object,
    onChange: PropTypes.func,
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

  render () {
    const { name, value, multiple, options, disabled, placeholder, style } = this.props

    return (
      <div className={`super-select${placeholder && !value ? ' placeholder' : ''}`} style={style}>
        <select ref='field' name={name} className='input-text inline' multiple={!!multiple} disabled={disabled} value={value} onChange={this.handleChange}>
          {placeholder ? <option value=''>{placeholder}</option> : null}
          {options.map(option => (
            (typeof option === 'string' || typeof option === 'number')
            ? <option key={option} value={option}>{option}</option>
            : <option key={option.id} value={option.id}>{option.name}</option>
          ))}
        </select>
        <div className='arrow'>▾</div>
      </div>
    )
  }
}
