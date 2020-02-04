import { kea } from 'kea'

export default kea({
  actions: () => ({
    openAddConnection: (introMessage = false) => ({ introMessage }),
  })
})
