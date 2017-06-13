// Initializes the `dashboard-items` service on path `/api/dashboard-items`
const createService = require('feathers-nedb');
const createModel = require('../../models/dashboard-items.model');
const hooks = require('./dashboard-items.hooks');
const filters = require('./dashboard-items.filters');

module.exports = function () {
  const app = this;
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'dashboard-items',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/api/dashboard-items', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('api/dashboard-items');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
