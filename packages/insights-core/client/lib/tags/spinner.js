import React from 'react'
import PropTypes from 'prop-types'

export default class Spinner extends React.Component {
  static propTypes = {
    color: PropTypes.string
  };

  static defaultProps = {
    color: 'gray'
  };

  render () {
    return (
      <div className={`loading-spinner ${this.props.color}`}>
        <div className='spinner-container container1'>
          <div className='circle1' />
          <div className='circle2' />
          <div className='circle3' />
          <div className='circle4' />
        </div>
        <div className='spinner-container container2'>
          <div className='circle1' />
          <div className='circle2' />
          <div className='circle3' />
          <div className='circle4' />
        </div>
        <div className='spinner-container container3'>
          <div className='circle1' />
          <div className='circle2' />
          <div className='circle3' />
          <div className='circle4' />
        </div>
      </div>
    )
  }
}
