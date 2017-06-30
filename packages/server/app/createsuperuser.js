// use these ENV variables to skip the prompts:
// - INSIGHTS_SUPERUSER_EMAIL
// - INSIGHTS_SUPERUSER_PASSWORD

const app = require('insights-core/app')
const prompt = require('prompt-promise')
const randomString = require('insights-core/app/lib/random-string')

const azAZ09 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function validateEmail (email) {
  var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email)
}

async function main () {
  console.log('Creating a new superuser')
  console.log('')

  let email = process.env.INSIGHTS_SUPERUSER_EMAIL || ''
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

  let password = process.env.INSIGHTS_SUPERUSER_PASSWORD || (await prompt.password('password (type or hit [enter] to autogenerate): '))
  let passwordGenerated = false

  if (!password) {
    passwordGenerated = true
    password = randomString(30, azAZ09)
  }

  try {
    await app.service('api/users').create({
      email: email,
      password: password,
      roles: ['superuser']
    })

    console.log('')
    console.log('Superuser created!')
    console.log(`  email: ${email}`)
    console.log(`  password: ${passwordGenerated ? password : '<whatever you entered>'}`)
  } catch (error) {
    console.error('Could not create superuser! Exception:')
    console.error(error)
    process.exit(1)
  }

  process.exit(0)
}

main()
