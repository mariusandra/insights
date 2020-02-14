import { TruncationType } from '../../definitions.d'

import { Pool } from 'pg'
import escape from 'pg-escape'

import SQL from './index'

export default class Postgres extends SQL {
  pool: Pool

  constructor (connection: string, timeout: number, timezone: string) {
    super(connection, timeout, timezone)

    this.pool = new Pool({
      connectionString: connection,
      statement_timeout: timeout ? timeout * 1000 : 15000
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
    return `(${sql} at time zone 'UTC' at time zone '${this.timezone}')`
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
