/* eslint-disable no-unused-vars */
class Service {
  constructor (options) {
    this.options = options || {}
  }

  find (params) {
    const { database, config } = require('../../../../config/insights')

    const getStructure = require('../../insights/structure')
    const createAdapter = require('../../insights/adapter')
    const Results = require('../../insights/results')

    const structure = getStructure(config)
    const adapter = createAdapter(database)

    const results = new Results({ params: params.query, adapter, structure })
    return results.getResponse()
  }
}

module.exports = function (options) {
  return new Service(options)
}

module.exports.Service = Service
