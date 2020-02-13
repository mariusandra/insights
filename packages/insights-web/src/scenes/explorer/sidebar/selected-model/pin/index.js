import React, { Component } from 'react'
import { connect } from 'kea'
import PropTypes from 'prop-types'
import { Icon } from 'antd'
import explorerLogic from 'scenes/explorer/logic'

const connection = {
  actions: [
    explorerLogic, [
      'addFavouriteRequest',
      'removeFavouriteRequest'
    ]
  ],
  props: [
    explorerLogic, [
      'favourites'
    ]
  ]
}
class Pin extends Component {
  static propTypes = {
    path: PropTypes.string
  }

  shouldComponentUpdate (nextProps, nextState) {
    return nextProps.path !== this.props.path || nextProps.favourites !== this.props.favourites
  }

  toggleFavourite = () => {
    const { path, favourites } = this.props
    const { addFavouriteRequest, removeFavouriteRequest } = this.props.actions

    if (favourites[path]) {
      removeFavouriteRequest(path)
    } else {
      addFavouriteRequest(path)
    }
  }

  render () {
    const { path, favourites } = this.props

    return (
      <span
        className={`favourite-star${favourites[path] ? ' in-favourites' : ' not-in-favourites'}`}
        onClick={this.toggleFavourite}>
         <Icon type="pushpin" theme={favourites[path] ? "filled" : ''} />
      </span>
    )
  }
}
const ConnectedPin = connect(connection)(Pin)
export default ConnectedPin
