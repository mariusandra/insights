import React, { Component } from 'react'
import { connect } from 'kea/logic'

import messg from 'messg'

import connectionsLogic from '~/scenes/connections/logic'

@connect({
  actions: [
    connectionsLogic, [
      'addConnection'
    ]
  ]
})
export default class OneFilter extends Component {
  constructor (props) {
    super(props)

    this.state = {
      keyword: '',
      url: '',
      adding: false,
      added: false
    }
  }

  handleAdd = (e) => {
    const { addConnection } = this.props.actions
    const { keyword, url } = this.state

    e.preventDefault()

    if (!keyword) {
      messg.error('You must enter a keyword', 2500)
      return
    }

    if (!url) {
      messg.error('You must enter a url', 2500)
      return
    }

    addConnection({ keyword, url })

    this.setState({ adding: false, keyword: '', url: '' })
  }

  render () {
    const { adding, keyword, url } = this.state

    return (
      <div>
        {adding ? (
          <div>
            <h2>Add a connection</h2>
            <br />
            <form onSubmit={this.handleAdd}>
              <div style={{marginBottom: 10}}>
                <strong>Keyword</strong>
                {' - '}
                This will be used in URLs, dashboards, etc to refer to your database. Changing it later will result in problems...
                <br />
                <input placeholder='mydb' value={keyword} onChange={e => this.setState({ keyword: e.target.value })} className='input-text' style={{width: 400}} />
              </div>
              <div style={{marginBottom: 10}}>
                <strong>Connection URL</strong>
                {' - '}
                Currently only URLs in the format "psql://user:pass@localhost/dbname" are supported.
                <br />
                <input placeholder='psql://user:pass@localhost/dbname' value={url} onChange={e => this.setState({ url: e.target.value })} className='input-text' style={{width: 400}} />
              </div>
              <div>
                <button type='submit'>Add</button>
                {' '}
                <button type='button' className='white' onClick={() => this.setState({ adding: false })}>Cancel</button>
              </div>
            </form>
          </div>
        ) : (
          <button onClick={() => this.setState({ adding: true })}>Add a connection</button>
        )}
      </div>
    )
  }
}
