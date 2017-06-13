// Initializes the `url` service on path `/api/url`
const createService = require('feathers-nedb');
const createModel = require('../../models/url.model');
const hooks = require('./url.hooks');
const filters = require('./url.filters');

module.exports = function () {
  const app = this;
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'url',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/api/url', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('api/url');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
