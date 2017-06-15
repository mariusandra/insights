const pgStructure = require('pg-structure')
const parse = require('pg-connection-string').parse
const changeCase = require('change-case')

module.exports = async function postgresGenerator (database) {
  const dbConfig = parse(database)
  const db = await pgStructure(dbConfig, ['public'])
  const tablesArray = db.get('public').tables

  let structure = {}

  tablesArray.forEach(table => {
    const name = table.name
    const model = changeCase.pascalCase(name)

    structure[model] = structure[model] || {
      enabled: true,
      model: model,
      table_name: name,
      columns: {},
      custom: {},
      links: {}
    }
  })

  tablesArray.forEach(table => {
    const name = table.name
    const model = changeCase.pascalCase(name)

    let primaryKey

    table.columns.forEach(column => {
      const { name, type, isPrimaryKey, foreignKeyConstraints } = column

      if (foreignKeyConstraints.size > 0) {
        foreignKeyConstraints.forEach(constraint => {
          const otherTableName = constraint.referencedTable.name
          const otherModel = changeCase.pascalCase(otherTableName)
          const otherKey = constraint.referencedColumnsBy.get(name).name

          const linkName = name.replace(/_id$/, '')
          structure[model].links[linkName] = {
            model: otherModel,
            model_key: otherKey,
            my_key: name
          }

          structure[otherModel].links[table.name] = {
            model: model,
            model_key: name,
            my_key: otherKey
          }
        })
      } else {
        let columnObject = {
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
    return 'number'
  case 'timestamp with time zone':
  case 'timestamp without time zone':
    return 'time'
  case 'character varying':
  case 'text':
    return 'string'
  case 'boolean':
    return 'boolean'
  default:
    console.warn('Unknown Postgres Type:', type)
    return type
  }
}
