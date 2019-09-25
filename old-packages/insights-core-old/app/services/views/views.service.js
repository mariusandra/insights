// Initializes the `views` service on path `/views`
const createService = require('feathers-nedb')
const createModel = require('../../models/views.model')
const hooks = require('./views.hooks')
const filters = require('./views.filters')

module.exports = function () {
  const app = this
  const Model = createModel(app)
  const paginate = app.get('paginate')

  const options = {
    name: 'views',
    Model,
    paginate
  }

  // Initialize our service with any options it requires
  app.use('/api/views', createService(options))

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('api/views')

  service.hooks(hooks)

  if (service.filter) {
    service.filter(filters)
  }
}
