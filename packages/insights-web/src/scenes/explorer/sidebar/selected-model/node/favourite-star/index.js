import React, { Component } from 'react'
import { connect } from 'kea'
import PropTypes from 'prop-types'

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
class FavouriteStar extends Component {
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
      <span onClick={this.toggleFavourite}>{favourites[path] ? '⭐' : '☆'}</span>
    )
  }
}
const ConnectedFavouriteStar = connect(connection)(FavouriteStar)
export default ConnectedFavouriteStar
