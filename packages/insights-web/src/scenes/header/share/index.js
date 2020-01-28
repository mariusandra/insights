import React, { Component } from 'react'

import { Dropdown, Button, Tooltip, message } from 'antd'

import copy from 'copy-to-clipboard'

import client from 'lib/client'

const urlService = client.service('urls')

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
        value={this.props.url}
        onChange={() => {}}
        className='bp3-input'
        placeholder='Generating URL...'
        style={{minWidth: 280}} />
    )
  }
}

export default class Share extends Component {
  constructor (props) {
    super(props)
    this.state = {
      url: '',
      path: ''
    }
  }

  handleCancel = () => {
    this.setState({
      url: '',
      path: ''
    })
  }

  handleShare = () => {
    const { url, path } = this.state
    const newPath = `${window.location.pathname}${window.location.search}`

    if (path === newPath) {
      copy(url)
      message.success('URL copied to clipboard!')
      this.setState({ path: '', url: '' })
    } else {
      urlService.create({ path: newPath }).then(url => {
        if (url) {
          this.setState({ path: newPath, url: window.location.origin + '/url/' + url.code })
        } else {
          message.error('Error')
        }
      })
    }
  }

  render () {
    const { url } = this.state
    return (
      <Dropdown overlay={<AutoFocusInput url={url} />} trigger={['click']} >
        <Tooltip title={url ? "Click to copy" : "Share this URL"}>
          <Button type="link" key={url ? 'copy-button' : 'generate-button'} icon={url ? 'copy' : 'link'} onClick={this.handleShare} style={{ color: '#e8f3fd' }} />
        </Tooltip>
      </Dropdown>
    )
  }
}
