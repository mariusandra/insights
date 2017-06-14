const commonHooks = require('feathers-hooks-common')
const { restrictToOwner } = require('feathers-authentication-hooks')

const { hashPassword } = require('feathers-authentication-local').hooks
const restrict = [
  restrictToOwner({
    idField: '_id',
    ownerField: '_id'
  })
]

module.exports = {
  before: {
    all: [],
    find: [],
    get: [ ...restrict ],
    create: [ hashPassword() ],
    update: [ ...restrict, hashPassword() ],
    patch: [ ...restrict, hashPassword() ],
    remove: [ ...restrict ]
  },

  after: {
    all: [
      commonHooks.when(
        hook => hook.params.provider,
        commonHooks.discard('password')
      )
    ],
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
