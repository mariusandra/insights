import { kea } from 'kea'

export default kea({
  actions: () => ({
    toggleMenu: true
  }),

  reducers: ({ actions }) => ({
    menuOpen: [true, {
      [actions.toggleMenu]: (state) => !state
    }]
  })
})
