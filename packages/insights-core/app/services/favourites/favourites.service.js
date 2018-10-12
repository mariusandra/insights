// Initializes the `favourites` service on path `/favourites`
const createService = require('feathers-nedb');
const createModel = require('../../models/favourites.model');
const hooks = require('./favourites.hooks');
const filters = require('./favourites.filters');

module.exports = function () {
  const app = this;
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'favourites',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/api/favourites', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('api/favourites');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
