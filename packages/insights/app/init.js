const fs = require('fs')
const path = require('path')
const prompt = require('prompt-promise')
const randomString = require('./lib/random-string')
const root = path.join(__dirname, '..')
const pkg = require(path.join(root, 'package.json'))

const createFolder = require('./lib/create-folder')

const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

async function initInsights ({ dev = false, noLogin = false }) {
  console.log(`Welcome to Insights v${pkg.version}!`)
  console.log('')
  console.log('We will create a directory .insights to store your config data.')
  console.log('Please add it to .gitignore!') // TODO: add to gitignore!
  console.log('')

  const configFolder = path.join(process.cwd(), '.insights')
  createFolder(configFolder)
  process.env.NODE_CONFIG_DIR = configFolder

  console.log('')
  if (!noLogin) {
    console.log('In order to use insights, you must create at least one user you will use to log in.')
  }

  const secretKey = randomString(64)

  if (dev) {
    let developmentTemplate = require('./templates/development.json')
    developmentTemplate.authentication.secret = secretKey
    if (noLogin) {
      developmentTemplate.authentication.noLogin = true
    }
    fs.writeFileSync(path.join(configFolder, 'development.json'), JSON.stringify(developmentTemplate, null, 2))
  }

  let productionTemplate = require('./templates/production.json')
  productionTemplate.authentication.secret = secretKey
  if (noLogin) {
    productionTemplate.authentication.noLogin = true
  }
  fs.writeFileSync(path.join(configFolder, 'production.json'), JSON.stringify(productionTemplate, null, 2))

  const defaultTemplate = require('./templates/default.json')
  if (noLogin) {
    delete defaultTemplate.authentication.local
    defaultTemplate.authentication.authStrategies = defaultTemplate.authentication.authStrategies.filter(s => s !== 'local')
  }
  fs.writeFileSync(path.join(configFolder, 'default.json'), JSON.stringify(defaultTemplate, null, 2))

  if (noLogin) {
    const user = (await exec(`whoami`)).stdout.trim() || 'root'
    const host = (await exec(`hostname`)).stdout.trim() || 'localhost'
    process.env.INSIGHTS_SUPERUSER_EMAIL = `${user}@${host}`
    process.env.INSIGHTS_SUPERUSER_PASSWORD = randomString(128)
  }

  const createSuperuser = require('./create-superuser')
  await createSuperuser({ noLogin })

  process.exit(0)
}

module.exports = initInsights
