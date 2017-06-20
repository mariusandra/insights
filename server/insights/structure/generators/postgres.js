const pgStructure = require('pg-structure')
const parse = require('pg-connection-string').parse
const changeCase = require('change-case')
const singular = require('pluralize').singular

module.exports = async function postgresGenerator (database) {
  const dbConfig = parse(database)
  const db = await pgStructure(dbConfig, ['public'])
  const tablesArray = db.get('public').tables

  let structure = {}

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

          if (structure[otherModel].links[reverseKey]) {
            structure[otherModel].links[`${reverseKey}_1`] = structure[otherModel].links[reverseKey]
            delete structure[otherModel].links[reverseKey]
          }

          if (structure[otherModel].links[`${reverseKey}_1`]) {
            for (let i = 2; i < Object.keys(structure[otherModel].links).length + 1; i++) {
              if (!structure[otherModel].links[`${reverseKey}_${i}`]) {
                reverseKey = `${reverseKey}_${i}`
                break
              }
            }
          }

          structure[otherModel].links[reverseKey] = {
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
    return 'string'
  case 'boolean':
    return 'boolean'
  default:
    console.warn('Unknown Postgres Type:', type)
    return type
  }
}
