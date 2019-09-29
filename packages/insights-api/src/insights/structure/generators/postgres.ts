import { Structure, StructureColumn } from '../../definitions'

import pgStructure from 'pg-structure'
import { parse } from 'pg-connection-string'
import changeCase from 'change-case'
import { singular } from 'pluralize'

export default async function postgresGenerator (database: string): Promise<Structure> {
  const dbConfig = parse(database)
  const db = await pgStructure(dbConfig, ['public'])
  const tablesArray = db.get('public').tables

  let structure: Structure = {}
  let multiples = {}

  tablesArray.forEach(table => {
    const name = table.name
    const model = changeCase.pascalCase(singular(name))

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
    const model = changeCase.pascalCase(singular(name))

    let primaryKey

    table.columns.forEach(column => {
      const { name, type, isPrimaryKey, foreignKeyConstraints } = column

      if (foreignKeyConstraints.size > 0) {
        foreignKeyConstraints.forEach(constraint => {
          const otherTableName = constraint.referencedTable.name
          const otherModel = changeCase.pascalCase(singular(otherTableName))
          const otherKey = constraint.referencedColumnsBy.get(name).name

          const linkName = name.replace(/_id$/, '')
          structure[model].links[linkName] = {
            model: otherModel,
            model_key: otherKey,
            my_key: name
          }

          let reverseKey = table.name

          if (structure[otherModel].links[table.name]) {
            multiples[otherModel][table.name] = true

            let otherReverseKey = `${table.name}_as_${structure[otherModel].links[table.name].model_key.replace(/_id$/, '')}`
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
          type: convertPgType(type)
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

function convertPgType (type) {
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
  case 'name':
    return 'string'
  case 'boolean':
    return 'boolean'
  default:
    console.warn('Unknown Postgres Type:', type)
    return type
  }
}
