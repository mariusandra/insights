const fs = require('fs')

module.exports = function createFolder (folder) {
  console.log(`Creating folder: ${folder}`)

  if (fs.existsSync(folder)) {
    console.error('!! Fatal Error! Folder already exists! Will not overwrite, exiting...')
    process.exit(1)
  }

  try {
    fs.mkdirSync(folder, {recursive: true})
  } catch (error) {
    console.error(`!! Fatal Error! Could not create folder: ${folder}`)
    process.exit(1)
  }
}
