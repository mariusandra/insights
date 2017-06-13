const structure = require('./structure/structure.service.js')
const results = require('./results/results.service.js')
const views = require('./views/views.service.js')
const dashboards = require('./dashboards/dashboards.service.js')
const url = require('./url/url.service.js')
const dashboardItems = require('./dashboard-items/dashboard-items.service.js');
module.exports = function () {
  const app = this // eslint-disable-line no-unused-vars
  app.configure(structure)
  app.configure(results)
  app.configure(views)
  app.configure(dashboards)
  app.configure(url)
  app.configure(dashboardItems);
}
