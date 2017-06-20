import './styles.scss'

// libraries
import React, { Component } from 'react'
import { connect } from 'kea/logic'

// utils

// components
import Spinner from 'lib/tags/spinner'
import StructureModel from './model'

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
      'isLoading',
      'structure',
      'connection',
      'models'
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
    const { isLoading, structure, connection, models } = this.props

    if (isLoading || !connection || !structure) {
      return (
        <div className='structure-scene'>
          <Spinner />
        </div>
      )
    }

    return (
      <div className='structure-scene'>
        <div>
          <a href='/connections' onClick={this.handleOpenConnections}>&laquo; Back to all connections</a>
          <br /><br />
          <h2>Connection: {connection.keyword}</h2>
          <br />
          {models.map(model => (
            <StructureModel key={model} model={model} modelStructure={structure[model]} />
          ))}
        </div>
      </div>
    )
  }
}
