const fs = require('fs')
const path = require('path')
const prompt = require('prompt-promise')
const randomString = require('./lib/random-string')
const root = path.join(__dirname, '..')
const pkg = require(path.join(root, 'package.json'))

const createFolder = require('./lib/create-folder')

const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

async function initInsights ({
  dev = false,
  login = undefined,
  configFolder = path.join(process.cwd(), '.insights'),
  exitWhenDone = true
}) {
  console.log(`Welcome to Insights v${pkg.version}!`)
  console.log('')

  if (fs.existsSync(configFolder)) {
    console.error('!! Fatal Error! The folder ".insights" already exists. ')
    console.error('   Could not complete init.')
    process.exit(1)
  }

  console.log('This script will create a folder ".insights", which will be used to store')
  console.log('config data. Please add it to .gitignore if you\'re running this script')
  console.log('inside a project folder!')
  console.log('')

  if (login === undefined) {
    let repeat = true

    console.log('Do you wish to setup Insights in "login" mode, requiring authentication to')
    console.log('access the interface or in standalone "loginless" mode, which is practical')
    console.log('only when running in localhost.')
    console.log('')

    while (repeat) {
      const answer = (await prompt('Setup Insights in "login" mode? (Y/n): ')).trim()
      const letter = answer.toLowerCase()[0]

      if (answer === '' || letter === 'y' || letter === 'n') {
        repeat = false
        login = letter !== 'n'
      } else {
        console.error('!! Please answer either "y" or "n" or hit CTRL+C to cancel')
      }
      console.log('')
    }
  }

  createFolder(configFolder)
  process.env.NODE_CONFIG_DIR = configFolder

  console.log('')

  if (login) {
    console.log('In order to log in to Insights you must create at least one user account.')
    console.log('Run "insights createsuperuser" or use the web interface to create more later.')
    console.log('')
  }

  const secretKey = randomString(64)

  if (dev) {
    let developmentTemplate = require('./templates/development.json')
    developmentTemplate.authentication.secret = secretKey
    developmentTemplate.authentication.authStrategies = ['jwt', login ? 'local' : 'noLogin']
    fs.writeFileSync(path.join(configFolder, 'development.json'), JSON.stringify(developmentTemplate, null, 2))
  }

  let productionTemplate = require('./templates/production.json')
  productionTemplate.authentication.secret = secretKey
  productionTemplate.authentication.authStrategies = ['jwt', login ? 'local' : 'noLogin']
  fs.writeFileSync(path.join(configFolder, 'production.json'), JSON.stringify(productionTemplate, null, 2))

  const defaultTemplate = require('./templates/default.json')
  fs.writeFileSync(path.join(configFolder, 'default.json'), JSON.stringify(defaultTemplate, null, 2))

  if (!login) {
    const user = (await exec(`whoami`)).stdout.trim() || 'anonymous'
    const host = (await exec(`hostname`)).stdout.trim() || 'localhost'
    process.env.INSIGHTS_SUPERUSER_EMAIL = `${user}@${host}`
  }

  const createSuperuser = require('./create-superuser')
  await createSuperuser({ login, exit: false })

  console.log('')
  console.log('Success! Run "insights start" to start the server!')

  if (exitWhenDone) {
    process.exit(0)
  }
}

module.exports = initInsights
