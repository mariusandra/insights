// use these ENV variables to skip the prompts:
// - INSIGHTS_...

const fs = require('fs')
const path = require('path')
const prompt = require('prompt-promise')
const randomString = require('./lib/random-string')
const root = path.join(__dirname, '..')
const pkg = require(path.join(root, 'package.json'))

const createFolder = require('./lib/create-folder')
const createSecret = require('./create-secret')

const azAZ09 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function validateEmail (email) {
  var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email)
}

module.exports = async function initInsights () {
  console.log(`Welcome to Insights v${pkg.version}!`)
  console.log('')
  console.log('We will create a directory .insights to store your config data.')
  console.log('Please add it to .gitignore!') // TODO: add to gitignore!
  console.log('')

  const configFolder = path.join(process.cwd(), '.insights')
  createFolder(configFolder)

  process.env.INSIGHTS_CONFIG_FOLDER = configFolder
  process.env.NODE_CONFIG_DIR = configFolder
  process.env.INSIGHTS_DATA = path.join(configFolder, 'data')

  const secretPath = `${configFolder}/secret`
  createSecret(secretPath)

  console.log('')
  console.log('In order to use insights, you must create at least one user you will use to log in.')
  console.log('(Loginless root mode for localhost usage coming soon. For now please create a user)')
  console.log('')

  const template = require('./templates/production.json')
  fs.writeFileSync(path.join(configFolder, 'production.json'), JSON.stringify(template, null, 2))

  const createSuperuser = require('./create-superuser')
  await createSuperuser()

  process.exit(0)
}
