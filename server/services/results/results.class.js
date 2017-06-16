const getStructure = require('../../insights/structure')
const createAdapter = require('../../insights/adapter')
const Results = require('../../insights/results')

class Service {
  constructor (options) {
    this.options = options || {}
  }

  setup (app) {
    this.app = app
  }

  async find (params) {
    const { connection } = params
    const connectionsResult = await this.app.service('api/connections').find({ keyword: connection })

    const { structurePath, url } = connectionsResult.data[0]

    const structure = await getStructure(structurePath, url)
    const adapter = createAdapter(url)

    const results = new Results({ params: params.query, adapter, structure })
    return results.getResponse()
  }
}

module.exports = function (options) {
  return new Service(options)
}

module.exports.Service = Service
