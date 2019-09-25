const { Pool } = require('pg')
const escape = require('pg-escape')

const SQL = require('./index')

const { timezone } = require('../../../../config/insights')

module.exports = class Postgres extends SQL {
  constructor (connection) {
    super(connection)

    this.pool = new Pool({
      connectionString: connection
    })
  }

  quote (string) {
    return escape('%L', string)
  }

  async execute (sql) {
    try {
      console.log('Executing', sql)
      return await this.pool.query(sql)
    } catch (error) {
      console.error('Error with SQL', sql)
      console.error(error)
      throw error
    }
  }

  convertSqlTimezone (sql) {
    return `(${sql} at time zone 'UTC' at time zone '${timezone}')`
  }

  allowedDateTruncations () {
    return ['hour', 'day', 'week', 'month', 'quarter', 'year']
  }

  truncateDate (sql, truncation) {
    if (!this.allowedDateTruncations().includes(truncation)) {
      throw new Error(`Bad date truncation '${truncation}'`)
    }

    return `date_trunc('${truncation}', ${sql})::date`
  }

  filterContains (sql, string) {
    return `(${sql}) ilike ${this.quote('%' + string + '%')}`
  }
}
