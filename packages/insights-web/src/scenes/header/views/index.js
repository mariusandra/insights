import './styles.scss'

import React, { Component } from 'react'
import { connect } from 'kea'

import { Dropdown, Button, Menu, Icon, Modal } from 'antd'

import viewsLogic from 'scenes/header/views/logic'

const logic = connect({
  actions: [
    viewsLogic, [
      'setNewName',
      'openNew',
      'saveView',
      'cancelNew',
      'openView'
    ]
  ],
  props: [
    viewsLogic, [
      'newName',
      'newOpen',
      'sortedViews'
    ],
    state => state.router.location, [
      'pathname'
    ]
  ]
})

class Views extends Component {
  constructor (props) {
    super(props)
    this.state = {
      tooltipHover: false
    }
  }

  handleTooltip = (tooltipHover) => {
    this.setState({ tooltipHover })
  }

  saveView = (e) => {
    const { saveView } = this.props.actions
    e.preventDefault()
    saveView()
  }

  openView = (id) => {
    const { openView } = this.props.actions
    openView(id)
  }

  render () {
    const { newName, sortedViews, newOpen, pathname } = this.props
    const { setNewName, openNew, cancelNew } = this.props.actions

    const overlay = (
      <Menu>
        {pathname.includes('/explorer')
          ? <Menu.Item shouldDismissPopover={false} onClick={openNew}>
              <Icon type='plus' />
              Save this view
            </Menu.Item>
          : <Menu.Item icon='plus' disabled onClick={openNew}>
              <Icon type='plus' />
              Open the explorer to save views
            </Menu.Item>
        }

        <Menu.Divider />

        {sortedViews.map(view => (
          <Menu.Item
            key={view._id}
            style={{maxWidth: 300}}
            multiline
            icon='th-derived'
            onClick={() => this.openView(view._id)}>{view.name}</Menu.Item>
        ))}
      </Menu>
    )

    return (
      <>
        <Dropdown overlay={overlay} trigger={['click']} >
          <Button shape="link" icon="star" />
        </Dropdown>

        {newOpen ? (
          <Modal
            icon='info-sign'
            onOk={this.saveView}
            onCancel={cancelNew}
            title='Enter a title'
            visible
          >
            <form onSubmit={this.saveView}>
              <input
                className='bp3-input bp3-fill'
                placeholder='Enter a title'
                onChange={e => setNewName(e.target.value)}
                value={newName}
                autoFocus />
            </form>
          </Modal>
        ) : null}
      </>
    )
  }
}

export default logic(Views)
