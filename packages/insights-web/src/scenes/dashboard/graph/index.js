// libraries
import React, { Component } from 'react'
import { connect } from 'kea'
import PropTypes from 'prop-types'

import Dimensions from 'react-dimensions'
import moment from 'moment'

// utils
import urlToState from 'lib/explorer/url-to-state'
import promptPopup from 'lib/popups/prompt'

// components
import ExplorerGraph from 'scenes/explorer/graph'
import Spinner from 'lib/tags/spinner'

// logic
import dashboardLogic from 'scenes/dashboard/logic'
import headerLogic from 'scenes/header/logic'

import client from 'lib/client'
const resultsService = client.service('api/results')

const logic = connect({
  actions: [
    headerLogic, [
      'openLocation'
    ],
    dashboardLogic, [
      'deleteItem',
      'renameItem'
    ]
  ],
  props: [
    dashboardLogic, [
      'items'
    ]
  ]
})

class DashboardGraph extends Component {
  static propTypes = {
    name: PropTypes.string,
    path: PropTypes.string,
    containerWidth: PropTypes.number,
    containerHeight: PropTypes.number,
    isResizing: PropTypes.bool,
    itemId: PropTypes.string,
    dashboardId: PropTypes.string
  }

  constructor (props) {
    super(props)

    this.state = {
      graph: null,
      graphKeys: null,
      graphData: null,
      loaded: false,
      isResizing: false
    }
  }

  componentDidMount () {
    const { path } = this.props

    resultsService.find({ query: { ...urlToState(path), graphOnly: true } }).then(response => {
      const { graph } = response
      const graphKeys = graph.keys

      const graphData = graph.results.map(row => {
        const time = row.time
        return Object.assign({}, row, { time: moment(time).valueOf() })
      })

      this.setState({ graph, graphKeys, graphData, loaded: true })
    })
  }

  // fix jerky post-resize double resize by adding a 100min delay to the isResizing change
  componentWillUpdate (nextProps) {
    if (this.props.isResizing && !nextProps.isResizing) {
      if (this._resizeTimeout) {
        window.clearTimeout(this._resizeTimeout)
      }
      this._resizeTimeout = window.setTimeout(() => {
        this.setState({ isResizing: false })
      }, 100)
    }
    if (!this.props.isResizing && nextProps.isResizing) {
      this.setState({ isResizing: true })
      if (this._resizeTimeout) {
        window.clearTimeout(this._resizeTimeout)
      }
    }
  }

  componentWillUnmount () {
    if (this._resizeTimeout) {
      window.clearTimeout(this._resizeTimeout)
    }
  }

  handleEdit = () => {
    const { name, itemId, dashboardId } = this.props
    const { renameItem } = this.actions

    promptPopup('Please enter a new name', name).then(newName => {
      if (newName !== null && newName !== name) {
        renameItem(dashboardId, itemId, newName)
      }
    })
  }

  handleDelete = () => {
    const { itemId, dashboardId } = this.props
    const { deleteItem } = this.actions

    deleteItem(dashboardId, itemId)
  }

  render () {
    const { name, path, containerWidth, containerHeight } = this.props
    const { loaded, graph, graphKeys, graphData, isResizing } = this.state
    const { openLocation } = this.actions

    return (
      <div style={{ width: containerWidth, height: containerHeight }}>
        <div style={{ width: containerWidth, height: 30, background: '#fafafa', borderBottom: '1px solid #eee' }}>
          <div style={{ lineHeight: '30px', marginLeft: 10 }}>
            {name || 'Untitled graph'}
            {' '}
            <i className='fa fa-edit' onClick={this.handleEdit} style={{ cursor: 'pointer' }} />
          </div>
          <button
            style={{position: 'absolute', top: 0, right: 0, marginBottom: 0}}
            onClick={() => openLocation(path)}
            className='fa fa-search-plus' />
          <i
            className='fa fa-trash'
            onClick={this.handleDelete}
            style={{ position: 'absolute', top: 8, right: 45, cursor: 'pointer' }} />
        </div>
        <div style={{ width: containerWidth, height: containerHeight - 30, backgroundColor: isResizing ? '#eeeeee' : '', overflow: 'hidden' }}>
          {loaded && !isResizing ? (
            <ExplorerGraph graph={graph} graphKeys={graphKeys} graphData={graphData} />
          ) : isResizing ? (
            <span style={{position: 'absolute', left: containerWidth / 2 - 10, top: containerHeight / 2 - 10, fontSize: 48, color: '#888888'}}>
              <i className='fa fa-arrows-alt' />
            </span>
          ) : (
            <span style={{position: 'absolute', left: containerWidth / 2 - 10, top: containerHeight / 2 - 10}}>
              <Spinner />
            </span>
          )}
        </div>
      </div>
    )
  }
}

export default logic(Dimensions({ elementResize: true })(DashboardGraph))
