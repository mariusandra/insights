import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Spinner from 'lib/tags/spinner'

// NB: Settings isDisabled = true will just change the color of the button.
//     It will still have an onClick, as this is expected to be delegated to redux-form which will show validation errors.

export default class SubmitButton extends Component {
  static propTypes = {
    isSubmitting: PropTypes.bool,
    isDisabled: PropTypes.bool,
    className: PropTypes.string,
    spinnerClass: PropTypes.string,
    onClick: PropTypes.func,
    children: PropTypes.node
  }

  render () {
    const { isSubmitting, isDisabled, children, className, spinnerClass, onClick, ...other } = this.props

    return (
      <button type='button' {...isSubmitting ? {} : { onClick }} className={`button${isDisabled ? ' disabled' : ''}${className ? ' ' + className : ''}`} {...other}>
        {isSubmitting ? (
          <Spinner color={spinnerClass || 'white'} />
        ) : children}
      </button>
    )
  }
}
