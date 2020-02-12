import React, { Component } from 'react'
import { connect } from 'kea'
import PropTypes from 'prop-types'
import { Icon, Tooltip } from 'antd'
import explorerLogic from 'scenes/explorer/logic'
import { FullPath } from 'scenes/explorer/tags/full-path'

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
      <span
        className={`favourite-star${favourites[path] ? ' in-favourites' : ' not-in-favourites'}`}
        onClick={this.toggleFavourite}>
         <Tooltip placement={'left'} overlay={
           <span>
             {favourites[path] ? 'This field is pinned!' : 'Pin this field'}
             <FullPath path={path} rootIcon='pushpin' rootIconTheme={favourites[path] ? 'filled' : ''} />
           </span>
         }>
           <Icon type="pushpin" theme={favourites[path] ? "filled" : ''} />
         </Tooltip>
      </span>
    )
  }
}
const ConnectedFavouriteStar = connect(connection)(FavouriteStar)
export default ConnectedFavouriteStar
