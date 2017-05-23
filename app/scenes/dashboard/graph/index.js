// libraries
import React, { Component, PropTypes } from 'react'
import { connect } from 'kea/logic'

import Dimensions from 'react-dimensions'

// utils
import urlToState from 'lib/explorer/url-to-state'

// logic
import headerLogic from '~/scenes/header/logic'

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

  render () {
    const { name, path, containerWidth, containerHeight } = this.props
    const { openLocation } = this.props.actions

    return (
      <div style={{ width: containerWidth, height: containerHeight }}>
        {name ? (
          <div>
            <strong>{name}</strong>
          </div>
        ) : null}
        {JSON.stringify(urlToState(path))}
        <br />
        <button style={{position: 'absolute', top: 2, right: 2, marginBottom: 0}}
                onClick={() => openLocation(path)}
                className='fa fa-search-plus' />
        {containerWidth} x {containerHeight}
      </div>
    )
  }
}
