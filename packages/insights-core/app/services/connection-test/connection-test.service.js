// Initializes the `connection-test` service on path `/api/connection-test`
const createService = require('./connection-test.class.js')
const hooks = require('./connection-test.hooks')
const filters = require('./connection-test.filters')

module.exports = function () {
  const app = this
  const paginate = app.get('paginate')

  const options = {
    name: 'connection-test',
    paginate
  }

  // Initialize our service with any options it requires
  app.use('/api/connection-test', createService(options))

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('api/connection-test')

  service.hooks(hooks)

  if (service.filter) {
    service.filter(filters)
  }
}
