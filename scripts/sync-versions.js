const insightsVersion = require('../package.json').version
const semver = require('semver')

console.log(insightsVersion)

const jsons = {
  'insights': require('../packages/insights/package.json'),
  'insights-core': require('../packages/insights-core/package.json'),
  'insights-server': require('../packages/insights-server/package.json')
}

let error = false

// check if we can update
Object.keys(jsons).forEach(key => {
  console.log(`${key} version ${jsons[key].version}`)

  if (semver.lt(jsons[key].version, insightsVersion)) {
    console.log(`-> can update to ${insightsVersion}`)
  } else {
    error = true
    console.error(`[ERROR] must be less than ${insightsVersion}! Exiting!`)
  }
})

if (error) {
  process.exit(1)
}

// do the sync
Object.keys(jsons).forEach(key => {

})
