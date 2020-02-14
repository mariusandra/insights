import './styles.scss'

import React from 'react'
import { useValues } from 'kea'
import { Table, Avatar, Tag } from "antd"

import usersLogic from './logic'

const columns = [
  {
    title: '',
    dataIndex: 'profilePicture',
    key: 'avatar',
    width: 32,
    render: profilePicture => profilePicture
      ? <Avatar src={profilePicture} />
      : <Avatar icon="user" />
  },
  {
    title: 'E-mail',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Roles',
    dataIndex: 'roles',
    key: 'roles',
    render: roles => roles ? roles.map((role, index) => <Tag key={index}>{role}</Tag>) : null
  }
]

export default function UsersScene () {
  const { users, isLoading, hasError } = useValues(usersLogic)

  return (
    <div className='users-scene'>
      <h1>Users</h1>

      {isLoading ? 'Loading...' : hasError ? <div style={{ color: 'red' }}>Error Loading Users</div> : (
        <Table dataSource={users} columns={columns} rowKey='_id' />
      )}

      <br />

      <div>
        To add a new user, run in the terminal:
        <br />
        <code>$ insights createsuperuser</code>
      </div>
    </div>
  )
}
