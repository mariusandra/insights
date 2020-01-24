import { kea } from 'kea'
import NProgress from 'nprogress'

import client from '../../lib/client'

export default kea({
  actions: () => ({
    getUsers: () => ({}),
    gotUsers: (users) => ({ users }),
    gotError: true
  }),

  reducers: ({ actions }) => ({
    isLoading: [false, {
      [actions.getUsers]: () => true,
      [actions.gotUsers]: () => false,
      [actions.gotError]: () => false
    }],
    users: [[], {
      [actions.gotUsers]: (_, payload) => payload.users
    }],
    hasError: [false, {
      [actions.gotError]: () => true
    }]
  }),

  events: ({ actions }) => ({
    afterMount: () => {
      actions.getUsers()
    }
  }),

  listeners: ({ actions }) => ({
    [actions.getUsers]: async () => {
      NProgress.start()
      try {
        const usersService = client.service('users')
        const usersResponse = await usersService.find()
        actions.gotUsers(usersResponse.data)
      } catch (error) {
        actions.gotError()
      }
      NProgress.done()
    }
  })
})
