const authentication = require('feathers-authentication')
const jwt = require('feathers-authentication-jwt')
const local = require('feathers-authentication-local')

module.exports = function () {
  const app = this
  const config = app.get('authentication')

  // Set up authentication with the secret
  app.configure(authentication(config))
  app.configure(jwt())
  app.configure(local(config.local))

  // The `authentication` service is used to create a JWT.
  // The before `create` hook registers strategies that can be used
  // to create a new valid JWT (e.g. local or oauth2)
  app.service('authentication').hooks({
    before: {
      create: [
        authentication.hooks.authenticate(config.strategies)
      ],
      remove: [
        authentication.hooks.authenticate('jwt')
      ]
    },
    after: {
      create (hook) {
        hook.result.user = {
          _id: hook.params.user._id,
          email: hook.params.user.email
        }
      }
    }
  })
}
