// libraries
import React, { PropTypes, Component } from 'react'

// utils
import client from '~/client'
import { Button, Popover, Position, Menu, MenuItem, MenuDivider } from "@blueprintjs/core"

// logic
export default class User extends Component {
  static propTypes = {
    email: PropTypes.string
  }

  handleLogout = (e) => {
    e.preventDefault()
    client.logout()
    window.location.href = '/login'
  }

  render () {
    const exampleMenu = (
      <Menu>
        <MenuItem icon="user" text={this.props.email} />
        <MenuDivider />
        <MenuItem icon="log-out" text='Log out' onClick={this.handleLogout} />
      </Menu>
    )

    return (
      <Popover content={exampleMenu} minimal position={Position.RIGHT_BOTTOM}>
        <Button className='bp3-minimal' icon='user' />
      </Popover>
    )
  }
}
