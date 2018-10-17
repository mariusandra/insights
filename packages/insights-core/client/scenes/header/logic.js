import { kea } from 'kea'

export default kea({
  path: () => ['scenes', 'header', 'index'],

  actions: () => ({
    openLocation: (location) => ({ location })
  })
})
