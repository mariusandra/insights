import React, { Component } from 'react'

import { message, Button, Dropdown, Tooltip } from 'antd'

import copy from 'copy-to-clipboard'

import urlToState from 'lib/explorer/url-to-state'

class AutoFocusInput extends Component {
  componentDidMount () {
    const ref = this._inputRef
    ref.focus()
    ref.select()
  }

  componentDidUpdate () {
    const ref = this._inputRef
    ref.focus()
    ref.select()
  }

  setRef = (ref) => {
    this._inputRef = ref
  }

  handleFocus (event) {
    event.target.select()
  }

  render () {
    return (
      <input
        ref={this.setRef}
        onFocus={this.handleFocus}
        type='text'
        defaultValue={this.props.query}
        className='bp3-input'
        placeholder='Generating query...'
        style={{ minWidth: 280 }} />
    )
  }
}

export default class Share extends Component {
  constructor (props) {
    super(props)
    this.state = {
      query: ''
    }
  }

  handleCancel = () => {
    this.setState({
      query: ''
    })
  }

  handleShare = () => {
    const newPath = `${window.location.pathname}${window.location.search}`

    const rawQuery = urlToState(newPath)
    const query = JSON.stringify(rawQuery)
    this.setState({ query: query })

    copy(query)

    message.success('Query copied to clipboard!')
  }

  render () {
    const { query } = this.state
    return (
      <Dropdown overlay={<AutoFocusInput query={query} />} trigger={['click']} >
        <Tooltip title="Copy the code for the query" placement="bottomRight">
          <Button type="link" key={query ? 'copy-button' : 'generate-button'} icon='code' onClick={this.handleShare} style={{ color: '#e8f3fd' }} />
        </Tooltip>
      </Dropdown>
    )
  }
}
