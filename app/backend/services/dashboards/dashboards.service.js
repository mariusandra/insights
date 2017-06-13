// Initializes the `dashboards` service on path `/api/dashboards`
const createService = require('feathers-nedb')
const createModel = require('../../models/dashboards.model')
const hooks = require('./dashboards.hooks')
const filters = require('./dashboards.filters')

module.exports = function () {
  const app = this
  const Model = createModel(app)
  const paginate = app.get('paginate')

  const options = {
    name: 'dashboards',
    Model,
    paginate
  }

  // Initialize our service with any options it requires
  app.use('/api/dashboards', createService(options))

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('api/dashboards')

  service.hooks(hooks)

  if (service.filter) {
    service.filter(filters)
  }
}
