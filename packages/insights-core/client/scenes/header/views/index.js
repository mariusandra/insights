import './styles.scss'

// libraries
import React, { Component } from 'react'
import { connect } from 'kea/logic'

// utils
import { AnchorButton, Dialog, Classes, Intent, Button, Popover, Position, Menu, MenuItem, MenuDivider } from "@blueprintjs/core"
// components

// logic
import viewsLogic from '~/scenes/header/views/logic'

@connect({
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
    state => state.routing.locationBeforeTransitions, [
      'pathname'
    ]
  ]
})
export default class Views extends Component {
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
          ? <MenuItem icon='plus' text='Save this view' onClick={openNew} />
          : <MenuItem icon='plus' disabled text='Open the explorer to save views' onClick={openNew} />
        }

        <MenuDivider />

        {sortedViews.map(view => (
          <MenuItem key={view._id} icon="th-derived" text={view.name} onClick={() => this.openView(view._id)} />
        ))}
      </Menu>
    )

    return (
      <div>
        <Popover content={overlay} minimal position={Position.RIGHT_BOTTOM}>
          <Button className='bp3-minimal' icon='star' />
        </Popover>

        {newOpen ? (
          <Dialog
            icon='info-sign'
            onClose={cancelNew}
            title='Enter a title'
            isOpen
          >
            <div className='bp3-dialog-body'>
              <form onSubmit={this.saveView}>
                <input
                  className='bp3-input bp3-fill'
                  placeholder='Enter a title'
                  onChange={e => setNewName(e.target.value)}
                  value={newName}
                  autoFocus />
              </form>
            </div>
            <div className={Classes.DIALOG_FOOTER}>
              <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                <Button onClick={cancelNew}>Cancel</Button>
                <AnchorButton intent={Intent.PRIMARY} onClick={this.saveView}>Save</AnchorButton>
              </div>
            </div>
          </Dialog>

        ) : null}
      </div>
    )
  }
}
