import React, { Component } from 'react'
import { connect } from 'kea'

import { message, Form, Input, Modal } from "antd"

import connectionsLogic from '../../logic'

const logic = connect({
  values: [
    connectionsLogic, [
      'isAddOpen'
    ]
  ],
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
      message.error('You must enter a keyword')
      return
    }

    if (!url) {
      message.error('You must enter a url')
      return
    }

    addConnection({ keyword, url, structurePath, timeoutMs })

    this.setState({ keyword: '', url: '', timeoutMs: '' })
  }

  render () {
    const { keyword, url, structurePath, timeoutMs } = this.state
    const { isAddOpen } = this.props
    const { closeAddConnection } = this.actions

    return (
      <Modal visible={isAddOpen} title='New Connection' onOk={this.handleAdd} onCancel={closeAddConnection} canOutsideClickClose>
        <Form labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} onSubmit={this.handleAdd}>
          <Form.Item
            label='Keyword'
            extra='This will be used in URLs, dashboards, etc to refer to your database. Changing it later might result in problems...'>
            <Input autoFocus placeholder='mydb' value={keyword} onChange={e => this.setState({ keyword: e.target.value })} style={{width: '100%'}} />
          </Form.Item>

          <Form.Item
            label='Connection'
            extra='Currently only URLs in the format "psql://user:pass@localhost/dbname" are supported.'>
            <Input placeholder='psql://user:pass@localhost/dbname' value={url} onChange={e => this.setState({ url: e.target.value })} style={{width: '100%'}} />
          </Form.Item>

          <Form.Item
            label='Timeout'
            extra='Statement timeout in milliseconds'>
            <Input placeholder='no timeout' value={timeoutMs || ''} onChange={e => this.setState({ timeoutMs: e.target.value.replace(/[^0-9]/g, '') })} style={{width: '100%'}} />
          </Form.Item>

          <Form.Item
            label='insights.yml'
            extra='Leave empty to autodetect the database structure'>
            <Input placeholder='/Users/yourname/projects/code/insights.yml' value={structurePath} onChange={e => this.setState({ structurePath: e.target.value })} style={{width: '100%'}} />
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}

export default logic(AddDatabase)
