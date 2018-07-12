import React, { Component } from 'react'
import { connect } from 'kea/logic'

import { Button } from "@blueprintjs/core";
import Tooltip from 'rc-tooltip'
import Select from 'lib/forms/select'

import explorerLogic from '~/scenes/explorer/logic'
import headerLogic from '~/scenes/header/logic'

@connect({
  actions: [
    explorerLogic, [
      'addToDashboard'
    ],
    headerLogic, [
      'openLocation'
    ]
  ],
  props: [
    state => state.routing.locationBeforeTransitions, [
      'pathname',
      'search'
    ],
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
      name: '',
      added: false
    }
  }

  handleAdd = (e) => {
    const { addToDashboard } = this.props.actions
    const { dashboard, name } = this.state

    e.preventDefault()

    addToDashboard({ id: dashboard, name, path: `${window.location.pathname}${window.location.search}` })

    this.setState({ added: true, name: '' })
  }

  handleOpen = () => {
    const { dashboard } = this.state
    const { openLocation } = this.props.actions
    openLocation(`/dashboard/${dashboard}`)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.pathname !== this.props.pathname || nextProps.search !== this.props.search) {
      this.setState({ added: false })
    }
  }

  renderOverlay () {
    const { dashboards } = this.props
    const { dashboard, name, added } = this.state

    return (
      <div className='filter-options' style={{minWidth: 100}}>
        <div>
          <strong>Add graph to dashboard</strong>
        </div>
        {Object.keys(dashboards).length === 0 ? (
          <div>
            Please first create a dashboard from the dashboards page
          </div>
        ) : added ? (
          <div>
            <div style={{marginTop: 10, marginBottom: 10}}>
              Graph added!
            </div>
            <div>
              <span style={{textDecoration: 'underline', cursor: 'pointer'}} onClick={this.handleOpen}>
                Go to dashboard
              </span>
            </div>
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
        <Button icon='plus' style={{marginLeft: 5}}>Add to Dashboard</Button>
      </Tooltip>
    )
  }
}
