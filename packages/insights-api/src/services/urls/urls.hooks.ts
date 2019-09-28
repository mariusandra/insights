import * as authentication from '@feathersjs/authentication';
import { HookContext } from '@feathersjs/feathers'
import randomString from '../../utils/random-string'
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

const urlRandomCode = () => {
  return async (context: HookContext) => {
    context.data.code = randomString(10)
    return context
  }
}

export default {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [urlRandomCode()],
    update: [],
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
};
