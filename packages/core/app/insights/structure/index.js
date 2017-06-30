const yaml = require('js-yaml')
const fs = require('fs')

const generator = require('./generators')

let structureCache = {}

module.exports = async function (configPath, database) {
  if (configPath) {
    return getConfigStructure(configPath)
  } else if (structureCache[database]) {
    return structureCache[database]
  } else {
    const strucutre = await generator(database)
    structureCache[database] = strucutre
    return strucutre
  }
}

function getConfigStructure (configPath) {
  const structure = yaml.safeLoad(fs.readFileSync(configPath, 'utf8'))

  Object.keys(structure).forEach(model => {
    Object.keys(structure[model].columns).forEach(key => {
      if (structure[model].columns[key].type && structure[model].columns[key].type.match(/^:/)) {
        structure[model].columns[key].type = structure[model].columns[key].type.substring(1)
      }
      if (structure[model].columns[key].index && structure[model].columns[key].index.match(/^:/)) {
        structure[model].columns[key].index = structure[model].columns[key].index.substring(1)
      }
    })
    Object.keys(structure[model].custom).forEach(key => {
      if (structure[model].custom[key].type && structure[model].custom[key].type.match(/^:/)) {
        structure[model].custom[key].type = structure[model].custom[key].type.substring(1)
      }
    })
  })

  return structure
}
