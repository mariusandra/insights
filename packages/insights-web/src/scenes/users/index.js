import './styles.scss'

import React from 'react'
import { useValues } from 'kea'
import { Icon, Button } from "@blueprintjs/core"

import usersLogic from './logic'
import authLogic from 'scenes/auth'

export default function UsersScene () {
  const { users, isLoading, hasError } = useValues(usersLogic)
  const { user: currentUser } = useValues(authLogic)

  return (
    <div className='users-scene'>
      <h1>Users</h1>

      {isLoading ? 'Loading...' : hasError ? <div style={{ color: 'red' }}>Error Loading Users</div> : (
        <table className='users-table bp3-html-table bp3-html-table-striped'>
          <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>
                {user.profilePicture ? <img alt='Avatar' src={user.profilePicture} width={32} height={32} style={{ borderRadius: '100%' }} /> : <Icon icon='user' iconSize={32} />}
              </td>
              <td>
                {user.email}
              </td>
              <td>
                {(user.roles || []).join(', ')}
              </td>
              <td>
                <Icon icon='edit' />
                {' '}
                {currentUser._id !== user._id ? <Icon icon='trash' /> : null}
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      )}

      <br />

      <Button>Invite Users</Button>
    </div>
  )
}
