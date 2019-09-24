import './styles.scss'

import React, { Component } from 'react'
import { connect } from 'kea'

import Select from 'lib/forms/select'

import explorerLogic from '~/scenes/explorer/logic'

@connect({
  actions: [
    explorerLogic, [
      'setConnection'
    ]
  ],
  props: [
    explorerLogic, [
      'connections',
      'connection'
    ]
  ]
})
export default class Connection extends Component {
  render () {
    const { connections, connection } = this.props
    const { setConnection } = this.props.actions

    const options = Object.keys(connections).map(keyword => ({ id: keyword, name: keyword }))

    return (
      <div className='connection-select'>
        <Select value={connection || ''} options={options} onValueChange={(connection) => setConnection(connection)} />
      </div>
    )
  }
}
