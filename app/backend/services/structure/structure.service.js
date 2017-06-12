// Initializes the `structure` service on path `/structure`
const createService = require('./structure.class.js')
const hooks = require('./structure.hooks')
const filters = require('./structure.filters')

module.exports = function () {
  const app = this
  const paginate = app.get('paginate')

  const options = {
    name: 'structure',
    paginate
  }

  // Initialize our service with any options it requires
  app.use('/api/structure', createService(options))

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('api/structure')

  service.hooks(hooks)

  if (service.filter) {
    service.filter(filters)
  }
}
