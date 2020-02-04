// use these ENV variables to skip the prompts:
// - INSIGHTS_SUPERUSER_EMAIL
// - INSIGHTS_SUPERUSER_PASSWORD

process.env.NODE_ENV = 'production'

const app = require('insights-api/lib/app').default
const prompt = require('prompt-promise')
const randomString = require('./lib/random-string')

const azAZ09 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function validateEmail (email) {
  var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email)
}

async function createSuperuser ({ login = true, exit = true } = {}) {
  if (login) {
    console.log('Creating a new superuser')
    console.log('')
  }

  let email = process.env.INSIGHTS_SUPERUSER_EMAIL || ''
  if (!login && email && !validateEmail(email)) {
    email = 'root@localhost'
  }

  let repeat = !email || !validateEmail(email)

  while (repeat) {
    email = (await prompt('email: ')).trim()

    if (email && validateEmail(email)) {
      repeat = false
    } else {
      console.error('!! E-mail not valid! Please try again or hit CTRL+C to cancel')
      console.log('')
    }
  }

  let password = !login || process.env.INSIGHTS_SUPERUSER_PASSWORD || (await prompt.password('password (type or hit [enter] to autogenerate): '))
  let passwordGenerated = false

  if (!password) {
    passwordGenerated = true
    password = randomString(30, azAZ09)
  }

  try {
    if (!login) {
      await app.service('users').create({
        email: email,
        roles: ['superuser']
      })
    } else {
      await app.service('users').create({
        email: email,
        password: password,
        roles: ['superuser']
      })

      console.log('')
      console.log('Superuser created!')
      console.log(`  email: ${email}`)
      console.log(`  password: ${passwordGenerated ? password : '<whatever you entered>'}`)
    }
  } catch (error) {
    console.error('Could not create superuser! Exception:')
    console.error(error)
    process.exit(1)
  }

  if (exit) {
    process.exit(0)
  }
}

module.exports = createSuperuser
