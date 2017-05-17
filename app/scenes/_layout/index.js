import './styles.scss'

// libraries
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

// utils
import { Layout } from 'react-flex-layout'
import copy from 'copy-to-clipboard'
import messg from 'messg'

import urlController from '~/scenes/url/controller.rb'

// logic
@connect()
export default class InsightsScene extends Component {
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
    const { dispatch } = this.props
    const { url } = this.state

    if (window.location.search.indexOf('embed=true') >= 0) {
      return (
        <div className='insights-scene'>
          <Layout fill='window'>
            {this.props.children}
          </Layout>
        </div>
      )
    }

    return (
      <div className='insights-scene' style={{minHeight: '100%'}}>
        <Layout fill='window'>
          <Layout layoutHeight={40}>
            <div className='insights-tab-row'>
              <div className='tab-row-element'>
                <button onClick={() => dispatch(push('/explorer'))} className={window.location.pathname.indexOf('/explorer') === 0 ? 'button' : 'button white'}>Explorer</button>
              </div>
              <div className='tab-row-separator' />
              {url ? (
                <div className='tab-row-element'>
                  <input type='text' defaultValue={url} className='input-text' style={{margin: 0}} />
                </div>
              ) : null}
              <div className='tab-row-element'>
                <button key={url ? 'copy-button' : 'generate-button'} onClick={this.handleShare}>{url ? 'Copy' : 'Generate URL'}</button>
              </div>
            </div>
          </Layout>
          <Layout layoutHeight='flex'>
            {this.props.children}
          </Layout>
        </Layout>
      </div>
    )
  }
}
