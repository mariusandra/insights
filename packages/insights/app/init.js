// use these ENV variables to skip the prompts:
// - INSIGHTS_...

const fs = require('fs')
const path = require('path')
const prompt = require('prompt-promise')
const randomString = require('./lib/random-string')
const root = path.join(__dirname, '..')
const pkg = require(path.join(root, 'package.json'))

const createFolder = require('./lib/create-folder')
const createSecret = require('./createsecret')

const azAZ09 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function validateEmail (email) {
  var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email)
}

module.exports = async function initInsights () {
  console.log(`Welcome to Insights v${pkg.version}!`)
  console.log('')
  console.log('We will create a directory .insights to store your config data.')
  console.log('It is advised best to add it to .gitignore!')
  console.log('')

  const configPath = path.join(process.cwd(), '.insights')
  createFolder(configPath)

  const secretPath = `${configPath}/secret`
  createSecret(secretPath)

  process.exit(0)
}
