const createAdapter = require('../../insights/adapter')
const getStructure = require('../../insights/structure')

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
      const { url, structurePath } = await connectionsService.get(id)

      // check that this doesn't throw up
      await createAdapter(url).test()

      // if we want a structure from a file, test that it exists
      if (structurePath) {
        await getStructure(structurePath)
      }

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
