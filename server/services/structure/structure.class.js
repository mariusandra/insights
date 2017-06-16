const getStructure = require('../../insights/structure')

class Service {
  constructor (options) {
    this.options = options || {}
  }

  setup (app) {
    this.app = app
  }

  async get (id) {
    const { url, structurePath } = await this.app.service('api/connections').get(id)

    return getStructure(structurePath, url)
  }
}

module.exports = function (options) {
  return new Service(options)
}

module.exports.Service = Service
