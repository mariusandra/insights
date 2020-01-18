// libraries
import React, { Component } from 'react'

import { Button, Popover, Position } from "@blueprintjs/core";

// utils
import copy from 'copy-to-clipboard'
import messg from 'messg'

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
      messg.success('Copied to clipboard!', 2500)
      this.setState({ path: '', url: '' })
    } else {
      urlService.create({ path: newPath }).then(url => {
        if (url) {
          this.setState({ path: newPath, url: window.location.origin + '/url/' + url.code })
        } else {
          messg.error('Error', 2500)
        }
      })
    }
  }

  render () {
    const { url } = this.state
    return (
      <Popover minimal onClose={this.handleCancel} content={<AutoFocusInput url={url} />} position={Position.LEFT}>
        <Button key={url ? 'copy-button' : 'generate-button'} className='bp3-minimal' icon={url ? 'clipboard' : 'link'} onClick={this.handleShare} />
      </Popover>
    )
  }
}
