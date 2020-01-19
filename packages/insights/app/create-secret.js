var fs = require('fs')
var path = require('path')
var randomString = require('./lib/random-string')

module.exports = function createSecret(secretPath) {

  if (!secretPath) {
    console.error(`!! Fatal Error! No secretPath given!`)
    process.exit(1)
  }

  let folder = secretPath.split(path.sep)
  folder.pop()
  const folderPath = folder.join(path.sep)

  try {
    fs.mkdirSync(folderPath, {recursive: true})
  } catch (error) {
    console.error(`!! Fatal Error! Could not create folder: ${folderPath}`)
    process.exit(1)
  }

  try {
    fs.writeFileSync(secretPath, randomString(64), 'utf8')
    console.log(`New authentication secret stored at: ${secretPath}`)
  } catch (error) {
    console.error(`!! Fatal Error! Could not write authentication secret at ${secretPath}`)
    process.exit(1)
  }
}
