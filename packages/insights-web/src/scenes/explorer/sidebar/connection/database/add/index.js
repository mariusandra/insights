import React, { Component } from 'react'
import { connect } from 'kea'

import { FormGroup,  } from "@blueprintjs/core"

import messg from 'messg'

import connectionsLogic from '../../logic'

const logic = connect({
  actions: [
    connectionsLogic, [
      'addConnection',
      'closeAddConnection'
    ]
  ]
})

class AddDatabase extends Component {
  constructor (props) {
    super(props)

    this.state = {
      keyword: '',
      url: '',
      structurePath: '',
      timeoutMs: ''
    }
  }

  handleAdd = (e) => {
    const { addConnection } = this.props.actions
    const { keyword, url, structurePath, timeoutMs } = this.state

    e.preventDefault()

    if (!keyword) {
      messg.error('You must enter a keyword', 2500)
      return
    }

    if (!url) {
      messg.error('You must enter a url', 2500)
      return
    }

    addConnection({ keyword, url, structurePath, timeoutMs })

    this.setState({ keyword: '', url: '', timeoutMs: '' })
  }

  render () {
    const { keyword, url, structurePath, timeoutMs } = this.state
    const { closeAddConnection } = this.actions

    return (
      <div style={{ padding: 20, paddingBottom: 0 }}>
        <form onSubmit={this.handleAdd}>
          <FormGroup
            label='Keyword'
            helperText='This will be used in URLs, dashboards, etc to refer to your database. Changing it later might result in problems...'>
            <input autoFocus placeholder='mydb' value={keyword} onChange={e => this.setState({ keyword: e.target.value })} className='input-text' style={{width: '100%'}} />
          </FormGroup>

          <FormGroup
            label='Connection URL'
            helperText='Currently only URLs in the format "psql://user:pass@localhost/dbname" are supported.'>
            <input placeholder='psql://user:pass@localhost/dbname' value={url} onChange={e => this.setState({ url: e.target.value })} className='input-text' style={{width: '100%'}} />
          </FormGroup>

          <FormGroup
            label='Timeout'
            helperText='Statement timeout in milliseconds'>
            <input placeholder='no timeout' value={timeoutMs || ''} onChange={e => this.setState({ timeoutMs: e.target.value.replace(/[^0-9]/g, '') })} className='input-text' style={{width: '100%'}} />
          </FormGroup>

          <FormGroup
            label='insights.yml path'
            helperText='Leave empty to autodetect the database structure'>
            <input placeholder='/Users/yourname/projects/code/insights.yml' value={structurePath} onChange={e => this.setState({ structurePath: e.target.value })} className='input-text' style={{width: '100%'}} />
          </FormGroup>

          <div>
            <button type='submit'>Add</button>
            {' '}
            <button type='button' className='white' onClick={closeAddConnection}>Cancel</button>
          </div>
        </form>
      </div>
    )
  }
}

export default logic(AddDatabase)
