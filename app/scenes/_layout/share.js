import './styles.scss'

// libraries
import React, { Component } from 'react'
import { connect } from 'react-redux'

// utils
import copy from 'copy-to-clipboard'
import messg from 'messg'

import urlController from '~/scenes/url/controller.rb'

// logic
@connect()
export default class Share extends Component {
  constructor (props) {
    super(props)
    this.state = {
      url: '',
      path: ''
    }
  }

  handleShare = () => {
    const { url, path } = this.state
    const newPath = `${window.location.pathname}${window.location.search}`

    if (path === newPath) {
      copy(url)
      messg.success('Copied to clipboard!', 2500)
      this.setState({ path: '', url: '' })
    } else {
      urlController.createUrl({ path: newPath }).then(result => {
        if (result.path) {
          this.setState({ path: newPath, url: window.location.origin + result.path })
        } else {
          messg.error('Error', 2500)
        }
      })
    }
  }

  render () {
    const { url } = this.state
    return (
      <div className='tab-row-element'>
        {url ? (
          <input type='text' defaultValue={url} className='input-text' style={{margin: 0}} />
        ) : null}
        <button key={url ? 'copy-button' : 'generate-button'} onClick={this.handleShare} style={{marginLeft: 5}}>
          {url ? 'Copy' : 'Generate URL'}
        </button>
      </div>
    )
  }
}
