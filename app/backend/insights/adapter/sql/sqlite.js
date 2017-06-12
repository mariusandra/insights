const SQL = require('./index')

module.exports = class SQLite extends SQL {
  allowedDateTruncations () {
    return ['hour', 'day', 'month', 'year']
  }

  truncateDate (sql, truncation) {
    if (!this.allowedDateTruncations.includes(truncation)) {
      throw new Error(`Bad date truncation '${truncation}'`)
    }

    let dateSql = super.truncateDate(sql, truncation)

    if (truncation === 'day') {
      return `date(${dateSql})`
    } else {
      return `datetime(${dateSql}, 'start of ${truncation}')`
    }
  }

  filterEquals (sql, type, string) {
    if (type === 'boolean') {
      return `(${sql}) = ${this.quote(string === 'true' ? 't' : 'f')}`
    } else {
      return `(${sql}) = ${this.quote(string)}`
    }
  }
}
