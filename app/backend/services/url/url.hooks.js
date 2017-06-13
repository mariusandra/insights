
const urlRandomCode = require('../../hooks/url-random-code')

module.exports = {
  before: {
    all: [],
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
}
