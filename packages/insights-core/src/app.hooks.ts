// Application hooks that run for every service
// Don't remove this comment. It's needed to format import lines nicely.
import { HookContext } from '@feathersjs/feathers'

const setTimestamp = (name: string) => {
  return async (context: HookContext) => {
    context.data[name] = new Date()
    return context
  }
}

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [ setTimestamp('createdAt') ],
    update: [ setTimestamp('updatedAt') ],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
