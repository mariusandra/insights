/* eslint-disable no-unused-vars */

const createAdapter = require('../../insights/adapter')

class Service {
  constructor (options) {
    this.options = options || {}
  }

  setup (app) {
    this.app = app
  }

  async get (id, params) {
    const connectionsService = this.app.service('api/connections')

    try {
      const connection = await connectionsService.get(id)
      const working = await createAdapter(connection.url).test()
      return Promise.resolve({
        working: true
      })
    } catch (e) {
      return Promise.resolve({
        working: false,
        error: e.message
      })
    }
  }
}

module.exports = function (options) {
  return new Service(options)
}

module.exports.Service = Service
