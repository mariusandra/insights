import React from 'react'
import Popup from 'react-popup'

class Prompt extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      value: this.props.value
    }

    this.onChange = (e) => this._onChange(e)
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.value !== this.state.value) {
      this.props.onChange(this.state.value)
    }
  }

  _onChange (e) {
    let value = e.target.value

    this.setState({value: value})
  }

  render () {
    return (
      <form onSubmit={this.props.onSubmit}>
        <input autoFocus type='text' placeholder={this.props.placeholder} className='mm-popup__input' value={this.state.value} onChange={this.onChange} />
      </form>
    )
  }
}

/** Prompt plugin */
Popup.registerPlugin('prompt', function (title, defaultValue, placeholder, callback) {
  let promptValue = null
  let promptChange = function (value) {
    promptValue = value
  }
  let onFormSubmit = function (e) {
    e.preventDefault()
    callback(promptValue)
    Popup.close()
  }
  let onSubmit = function () {
    callback(promptValue)
    Popup.close()
  }

  this.create({
    title: title,
    content: <Prompt onChange={promptChange} placeholder={placeholder} value={defaultValue} onSubmit={onFormSubmit} />,
    buttons: {
      left: ['cancel'],
      right: [{
        text: 'Save',
        className: 'success',
        action: onSubmit
      }]
    }
  })
})

export default function promptPopup (title, defaultValue = '', placeholder = '') {
  return new Promise((resolve, reject) => {
    Popup.close()
    Popup.plugins().prompt(title, defaultValue, placeholder, function (value) {
      resolve(value)
    })
  })
}
