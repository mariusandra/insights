const fs = require('fs')
const path = require('path')
const prompt = require('prompt-promise')
const randomString = require('./lib/random-string')
const root = path.join(__dirname, '..')
const pkg = require(path.join(root, 'package.json'))

const createFolder = require('./lib/create-folder')

module.exports = async function initInsights ({ dev = false }) {
  console.log(`Welcome to Insights v${pkg.version}!`)
  console.log('')
  console.log('We will create a directory .insights to store your config data.')
  console.log('Please add it to .gitignore!') // TODO: add to gitignore!
  console.log('')

  const configFolder = path.join(process.cwd(), '.insights')
  createFolder(configFolder)
  process.env.NODE_CONFIG_DIR = configFolder

  console.log('')
  console.log('In order to use insights, you must create at least one user you will use to log in.')
  console.log('(Loginless root mode for localhost usage coming soon. For now please create a user)')
  console.log('')

  const secretKey = randomString(64)

  if (dev) {
    let developmentTemplate = require('./templates/development.json')
    developmentTemplate.authentication.secret = secretKey
    fs.writeFileSync(path.join(configFolder, 'development.json'), JSON.stringify(developmentTemplate, null, 2))
  }

  let productionTemplate = require('./templates/production.json')
  productionTemplate.authentication.secret = secretKey
  fs.writeFileSync(path.join(configFolder, 'production.json'), JSON.stringify(productionTemplate, null, 2))

  const defaultTemplate = require('./templates/default.json')
  fs.writeFileSync(path.join(configFolder, 'default.json'), JSON.stringify(defaultTemplate, null, 2))

  const createSuperuser = require('./create-superuser')
  await createSuperuser()

  process.exit(0)
}
