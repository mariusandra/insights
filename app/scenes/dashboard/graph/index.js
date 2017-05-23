// libraries
import React, { Component, PropTypes } from 'react'
import { connect } from 'kea/logic'
import Dimensions from 'react-dimensions'
import moment from 'moment'

// utils
import urlToState from 'lib/explorer/url-to-state'

// components
import ExplorerGraph from '~/scenes/explorer/graph'
import Spinner from 'lib/tags/spinner'

// logic
import headerLogic from '~/scenes/header/logic'

import explorerController from '~/scenes/explorer/controller.rb'


@connect({
  actions: [
    headerLogic, [
      'openLocation'
    ]
  ]
})
@Dimensions({ elementResize: true })
export default class DashboardGraph extends Component {
  static propTypes = {
    name: PropTypes.string,
    path: PropTypes.string,
    containerWidth: PropTypes.number,
    containerHeight: PropTypes.number
  }

  constructor (props) {
    super(props)

    this.state = {
      graph: null,
      graphKeys: null,
      graphData: null,
      loaded: false
    }
  }

  componentDidMount () {
    const { path } = this.props

    explorerController.getResults({ ...urlToState(path), graphOnly: true }).then(response => {
      const { graph } = response
      const graphKeys = graph.keys

      const graphData = graph.results.map(row => {
        const time = row.time
        return Object.assign({}, row, { time: moment(time).valueOf() })
      })

      this.setState({ graph, graphKeys, graphData, loaded: true })
    })
  }

  render () {
    const { name, path, containerWidth, containerHeight } = this.props
    const { loaded, graph, graphKeys, graphData } = this.state
    const { openLocation } = this.props.actions

    return (
      <div style={{ width: containerWidth, height: containerHeight }}>
        <div style={{ width: containerWidth, height: 30, background: '#fafafa', borderBottom: '1px solid #eee' }}>
          <div style={{ lineHeight: '30px', marginLeft: 10 }}>
            {name || 'Untitled graph'}
          </div>
          <button style={{position: 'absolute', top: 0, right: 0, marginBottom: 0}}
                  onClick={() => openLocation(path)}
                  className='fa fa-search-plus' />
        </div>
        <div style={{ width: containerWidth, height: containerHeight - 30 }}>
          {loaded ? (
            <ExplorerGraph graph={graph} graphKeys={graphKeys} graphData={graphData} />
          ) : (
            <span style={{position: 'absolute', left: containerWidth / 2 - 10, top: containerHeight / 2 - 10}}><Spinner /></span>
          )}
        </div>
      </div>
    )
  }
}
