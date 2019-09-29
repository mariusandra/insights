import { Structure } from '../definitions'

import yaml from 'js-yaml'
import fs from 'fs'

import generator from './generators'

type StructureCache = { [database: string]: Structure }
let structureCache: StructureCache = {}

export default async function (configPath?: string, database?: string) : Promise<Structure> {
  if (configPath) {
    return getConfigStructure(configPath)
  } else if (database && structureCache[database]) {
    return structureCache[database]
  } else if (database) {
    const strucutre = await generator(database)
    structureCache[database] = strucutre
    return strucutre
  } else {
    throw new Error('Must specify insights.yml path or database string')
  }
}

function getConfigStructure (configPath: string) : Structure {
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
