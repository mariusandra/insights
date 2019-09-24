// Initializes the `results` service on path `/api/results`
const createService = require('./results.class.js')
const hooks = require('./results.hooks')
const filters = require('./results.filters')

module.exports = function () {
  const app = this
  const paginate = app.get('paginate')

  const options = {
    name: 'results',
    paginate
  }

  // Initialize our service with any options it requires
  app.use('/api/results', createService(options))

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('api/results')

  service.hooks(hooks)

  if (service.filter) {
    service.filter(filters)
  }
}
