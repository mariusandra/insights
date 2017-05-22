import React, { Component } from 'react'
import { connect } from 'kea/logic'

import Tooltip from 'rc-tooltip'
import Select from 'lib/forms/select'

import explorerLogic from '~/scenes/explorer/logic'

@connect({
  actions: [
    explorerLogic, [
      'addToDashboard'
    ]
  ],
  props: [
    explorerLogic, [
      'dashboards'
    ]
  ]
})
export default class OneFilter extends Component {
  constructor (props) {
    super(props)

    this.state = {
      dashboard: Object.keys(props.dashboards)[0],
      name: ''
    }
  }

  handleAdd = (e) => {
    const { addToDashboard } = this.props.actions
    const { dashboard, name } = this.state

    e.preventDefault()

    addToDashboard({ id: dashboard, name, path: `${window.location.pathname}${window.location.search}` })
  }

  renderOverlay () {
    const { dashboards } = this.props
    const { dashboard, name } = this.state

    return (
      <div className='filter-options' style={{minWidth: 100}}>
        <div>
          <strong>Add graph to dashboard</strong>
        </div>
        {Object.keys(dashboards).length === 0 ? (
          <div>
            Please first create a dashboard from the dashboards page
          </div>
        ) : (
          <form onSubmit={this.handleAdd}>
            <div>
              <Select value={dashboard} options={Object.values(dashboards)} onValueChange={(dashboard) => this.setState({ dashboard })} />
            </div>
            <div>
              <input autoFocus placeholder='Graph name' value={name} onChange={e => this.setState({ name: e.target.value })} className='input-text' />
            </div>
            <div>
              <button type='submit'>Add</button>
            </div>
          </form>
        )}
      </div>
    )
  }

  render () {
    return (
      <Tooltip placement='bottom' trigger={['hover']} overlay={this.renderOverlay()}>
        <button style={{marginLeft: 5}}>+</button>
      </Tooltip>
    )
  }
}
