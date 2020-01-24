import { Structure, StructureColumn, ColumnType } from '../../definitions'

import pgStructure from 'pg-structure'
import { pascalCase } from 'change-case'
import { singular } from 'pluralize'

export default async function postgresGenerator (database: string): Promise<Structure> {
  const db = await pgStructure(database, { includeSchemas: ['public'] })
  const tablesArray = db.entities

  let structure: Structure = {}
  let multiples = {}

  tablesArray.forEach(table => {
    const name = table.name
    const model = pascalCase(singular(name))

    structure[model] = structure[model] || {
      enabled: true,
      model: model,
      table_name: name,
      columns: {},
      custom: {},
      links: {}
    }

    multiples[model] = {}
  })

  tablesArray.forEach(table => {
    const name = table.name
    const model = pascalCase(singular(name))

    let primaryKey

    table.columns.forEach(column => {
      const { name, type, isPrimaryKey, foreignKeys } = column

      if (foreignKeys.length > 0) {
        foreignKeys.forEach(foreignKey => {
          const otherTableName = foreignKey.referencedTable.name
          const otherModel = pascalCase(singular(otherTableName))
          const otherKey = foreignKey.referencedColumns[0].name

          const linkName = name.replace(/_id$/, '')
          structure[model].links[linkName] = {
            model: otherModel,
            model_key: otherKey,
            my_key: name
          }

          let reverseKey = table.name

          if (structure[otherModel].links[table.name]) {
            multiples[otherModel][table.name] = true

            const otherReverseKey = `${table.name}_as_${structure[otherModel].links[table.name].model_key.replace(/_id$/, '')}`
            structure[otherModel].links[otherReverseKey] = structure[otherModel].links[table.name]
            delete structure[otherModel].links[table.name]
          }

          if (multiples[otherModel][table.name]) {
            reverseKey = `${table.name}_as_${name.replace(/_id$/, '')}`
          }

          structure[otherModel].links[reverseKey] = {
            model: model,
            model_key: name,
            my_key: otherKey
          }
        })
      } else {
        let columnObject: StructureColumn = {
          type: convertPgType(type.name)
        }

        if (isPrimaryKey) {
          columnObject.index = 'primary_key'
          primaryKey = name
        }

        structure[model].columns[name] = columnObject
      }
    })

    if (primaryKey) {
      structure[model].primary_key = primaryKey
    }
  })

  return structure
}

function convertPgType (type: string) : ColumnType {
  switch (type) {
  case 'integer':
  case 'bigint':
  case 'numeric':
  case 'double precision':
    return 'number'
  case 'timestamp with time zone':
  case 'timestamp without time zone':
    return 'time'
  case 'date':
    return 'date'
  case 'character varying':
  case 'text':
  case 'json':
  case 'jsonb':
  case 'name':
  case 'uuid':
    return 'string'
  case 'boolean':
    return 'boolean'
  default:
    console.error('Unknown Postgres Type:', type)
    return 'unknown'
  }
}
