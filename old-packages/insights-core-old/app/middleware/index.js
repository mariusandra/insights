const handler = require('feathers-errors/handler')

module.exports = function () {
  // Add your custom middleware here. Remember, that
  // in Express the order matters, `notFound` and
  // the error handler have to go last.
  const app = this

  if (process.env.NODE_ENV === 'development') {
    // run webpack with hot module replacement in development
    const development = require('../../client/middleware')
    development(app)
  }

  app.use(handler())
}
