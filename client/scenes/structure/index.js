import './styles.scss'

// libraries
import React, { Component } from 'react'
import { connect } from 'kea/logic'

// utils

// components
import Spinner from 'lib/tags/spinner'

// logic
import structure from '~/scenes/structure/logic'

@connect({
  actions: [
    structure, [
      'openConnections'
    ]
  ],
  props: [
    structure, [
      'loading'
    ]
  ]
})
export default class StructureScene extends Component {
  handleOpenConnections = (e) => {
    const { openConnections } = this.props.actions

    e.preventDefault()
    openConnections()
  }

  render () {
    const { loading } = this.props

    return (
      <div className='structure-scene'>
        {loading ? <Spinner /> : (
          <div>
            <a href='/connections' onClick={this.handleOpenConnections}>Back to all connections</a>
            <br /><br />
            The structure interface will come here
          </div>
        )}
      </div>
    )
  }
}
