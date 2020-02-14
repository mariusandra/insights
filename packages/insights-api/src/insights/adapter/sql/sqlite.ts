import { ColumnType, TruncationType } from '../../definitions.d'

import SQL from './index'

export default class SQLite extends SQL {
  allowedDateTruncations () {
    return ['hour', 'day', 'month', 'year']
  }

  truncateDate (sql: string, truncation: TruncationType) {
    if (!this.allowedDateTruncations().includes(truncation)) {
      throw new Error(`Bad date truncation '${truncation}'`)
    }

    const dateSql = super.truncateDate(sql, truncation)

    if (truncation === 'day') {
      return `date(${dateSql})`
    } else {
      return `datetime(${dateSql}, 'start of ${truncation}')`
    }
  }

  filterEquals (sql: string, type: ColumnType, string: string) {
    if (type === 'boolean') {
      return `(${sql}) = ${this.quote(string === 'true' ? 't' : 'f')}`
    } else {
      return `(${sql}) = ${this.quote(string)}`
    }
  }
}
