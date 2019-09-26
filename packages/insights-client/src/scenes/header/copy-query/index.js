// libraries
import React, { Component } from 'react'
import { connect } from 'react-redux'

import { Button, Alignment, Text, Classes, H3, H5, InputGroup, Navbar, Switch, Tab, TabId, Tabs, Popover, Position } from "@blueprintjs/core";

// utils
import copy from 'copy-to-clipboard'
import messg from 'messg'

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

    console.log(rawQuery)
    console.log(query)

    copy(query)

    messg.success('Copied query to clipboard!', 2500)
  }

  render () {
    const { query } = this.state
    return (
      <Popover minimal onClose={this.handleCancel} content={<AutoFocusInput query={query} />} position={Position.LEFT}>
        <Button key={query ? 'copy-button' : 'generate-button'} className='bp3-minimal' icon='code' onClick={this.handleShare} />
      </Popover>
    )
  }
}
