const randomString = require('insights-core/app/lib/random-string')
const electronConnectApiKey = randomString(40)
const CustomStrategy = require('passport-custom')

const strategy = 'electron-connect-api-key'

module.exports = function () {
  const app = this

  const config = app.get('authentication')
  const settings = config[strategy]

  app.set('electronConnectApiKey', electronConnectApiKey)

  app.passport.use(strategy, new CustomStrategy(
    (req, callback) => {
      if (req.body && req.body.key && req.body.key === electronConnectApiKey) {
        // Do your custom user finding logic here, or set to false based on req object
        callback(null, { _id: '', email: '' })
      } else {
        // Do your custom user finding logic here, or set to false based on req object
        callback(null, false)
      }
    }
  ))
  app.passport.options(strategy, settings)
}
