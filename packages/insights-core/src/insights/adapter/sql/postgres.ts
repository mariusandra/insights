import { Pool } from 'pg'
import escape from 'pg-escape'

import SQL, { TruncationType } from './index'

import { timezone } from '../../../../config/insights'

export default class Postgres extends SQL {
  pool: Pool

  constructor (connection: string) {
    super(connection)

    this.pool = new Pool({
      connectionString: connection
    })
  }

  quote (string: string) {
    return escape('%L', string)
  }

  async execute (sql: string) {
    try {
      console.log('Executing', sql)
      return await this.pool.query(sql)
    } catch (error) {
      console.error('Error with SQL', sql)
      console.error(error)
      throw error
    }
  }

  convertSqlTimezone (sql: string) {
    return `(${sql} at time zone 'UTC' at time zone '${timezone}')`
  }

  allowedDateTruncations () {
    return ['hour', 'day', 'week', 'month', 'quarter', 'year']
  }

  truncateDate (sql: string, truncation: TruncationType) {
    if (!this.allowedDateTruncations().includes(truncation)) {
      throw new Error(`Bad date truncation '${truncation}'`)
    }

    return `date_trunc('${truncation}', ${sql})::date`
  }

  filterContains (sql: string, string: string) {
    return `(${sql}) ilike ${this.quote('%' + string + '%')}`
  }
}
