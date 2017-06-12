const moment = require('moment')

module.exports = class SQL {
  constructor (connection) {
    this.connection = connection
  }

  quote (string) {
    // TODO: make safe
    return `"${string}"`
  }

  execute (sql) {
    throw new Error('execute(sql) needs to be overridden!')
  }

  allowedDateTruncations () {
    return ['hour', 'day', 'week', 'month', 'quarter', 'year']
  }

  allowedAggregations () {
    return ['count', 'sum', 'min', 'max', 'avg']
  }

  fromTableAs (tableName, tableAlias) {
    return `FROM "${tableName}" AS "${tableAlias}"`
  }

  tableAliasWithColumn (tableAlias, column) {
    return `"${tableAlias}"."${column}"`
  }

  quotedColumnAlias (column) {
    return `"${column}"`
  }

  customSqlInTableReplace (sql, tableAlias) {
    return (sql || '').split('$$.').join(`"${tableAlias}".`)
  }

  convertSqlTimezone (sql) {
    return sql
  }

  truncateDate (sql, truncation) {
    if (!this.allowedDateTruncations.includes(truncation)) {
      throw new Error(`Bad date truncation '${truncation}'`)
    }
    return sql
  }

  addAggregation (sql, aggregation) {
    if (!this.allowedAggregations().includes(aggregation)) {
      throw new Error(`Bad aggregation function '${aggregation}'`)
    }

    if (aggregation === 'count') {
      return `count(distinct ${sql})`
    } else {
      return `${aggregation}(${sql})`
    }
  }

  leftJoin (tableName, tableAlias, tableKey, otherAlias, otherKey) {
    return `LEFT JOIN "${tableName}" "${tableAlias}" ON ("${tableAlias}"."${tableKey}" = "${otherAlias}"."${otherKey}")`
  }

  connectFromAndJoinsArray (array) {
    return array.join(' ')
  }

  filterEmpty (sql, type) {
    if (type === 'string') {
      return `((${sql}) IS NULL OR (${sql}) = '')`
    } else {
      return `(${sql}) IS NULL`
    }
  }

  filterPresent (sql, type) {
    if (type === 'string') {
      return `((${sql}) IS NOT NULL AND (${sql}) != '')`
    } else {
      return `(${sql}) IS NOT NULL`
    }
  }

  filterIn (sql, string) {
    return `(${sql}) in (${string.split(/, ?/).map(s => this.quote(s)).join(', ')})`
  }

  filterNotIn (sql, string) {
    return `(${sql}) not in (${string.split(/, ?/).map(s => this.quote(s)).join(', ')})`
  }

  filterEquals (sql, type, string) {
    return `(${sql}) = ${this.quote(string)}`
  }

  filterContains (sql, string) {
    return `(${sql}) like ${this.quote('%' + string + '%')}`
  }

  filterBetween (sql, string) {
    let conditions = []

    const [ start, finish ] = string.split(':')

    if (start) {
      conditions.push(`(${sql}) >= ${this.quote(start)}`)
    }

    if (finish) {
      conditions.push(`(${sql}) <= ${this.quote(finish)}`)
    }

    return conditions
  }

  filterDateRange (sql, string) {
    let conditions = []

    const [ start, finish ] = string.split(':')

    if (start) {
      const date = moment(start)
      if (date.valueOf()) {
        conditions.push(`(${sql}) >= ${this.quote(date.format('YYYY-MM-DD'))}`)
      }
    }

    if (finish) {
      const date = moment(finish)
      if (date.valueOf()) {
        conditions.push(`(${sql}) < ${this.quote(date.add(1, 'day').format('YYYY-MM-DD'))}`)
      }
    }

    return conditions
  }

  where (conditionsArray) {
    if (conditionsArray.length > 0) {
      return `WHERE ${conditionsArray.join(' AND ')}`
    } else {
      return ''
    }
  }

  having (conditionsArray) {
    if (conditionsArray.length > 0) {
      return `HAVING ${conditionsArray.join(' AND ')}`
    } else {
      return ''
    }
  }

  groupBy (groupPartsArray) {
    if (groupPartsArray.length > 0) {
      return `GROUP BY ${groupPartsArray.join(',')}`
    } else {
      return ''
    }
  }

  orderPart (sql, descending) {
    return `${sql} ${descending ? 'DESC' : 'ASC'}`
  }

  orderBy (orderPartsArray) {
    if (orderPartsArray.length > 0) {
      return `ORDER BY ${orderPartsArray.join(',')}`
    } else {
      return ''
    }
  }

  valueListToSelect (valueList) {
    const valueArray = valueList.map(value => `${value.sql} AS "${value.alias}"`)
    return valueArray.join(', ')
  }

  async getCount ({ fromAndJoins = '', where = '', group = '', having = '' }) {
    let countSql = `SELECT count(*) as count ${fromAndJoins} ${where} ${group} ${having}`

    if (group) {
      countSql = `SELECT count(*) as count FROM (${countSql}) AS t`
    }

    const countResults = await this.execute(countSql)
    return parseInt(countResults.rows[0]['count'])
  }

  async getResults ({ select = '', fromAndJoins = '', where = '', group = '', having = '', sort = '', limit = '', offset = '' }) {
    const limitSql = limit ? `LIMIT ${limit}` : ''
    const offsetSql = offset ? `OFFSET ${offset}` : ''
    const resultsSql = `SELECT ${select} ${fromAndJoins} ${where} ${group} ${having} ${sort} ${limitSql} ${offsetSql}`
    return (await this.execute(resultsSql)).rows
  }

  async getFacetValuesAndHasOther ({ column = '', fromAndJoins = '', where = '', group = '', having = '', limit = 10 }) {
    const select = `${column} AS facet_value, count(${column}) as facet_count`
    const sort = 'ORDER BY facet_count desc'

    let facetSql = `SELECT ${select} ${fromAndJoins} ${where} ${group} ${having} ${sort}`
    facetSql = 'SELECT t.facet_value, sum(t.facet_count) ' +
               `FROM (${facetSql}) t ` +
               'GROUP BY t.facet_value ' +
               'ORDER BY sum(t.facet_count) DESC ' +
               `LIMIT ${limit + 1}`

    const facetResults = await this.execute(facetSql)
    const facetValues = facetResults.rows.map(r => r.facet_value)

    const valuesToReturn = facetValues.slice(0, limit)
    const hasOther = facetValues.length > limit

    return [valuesToReturn, hasOther]
  }

  facetedValuesOrOther (columnSql, facetValues, otherValue) {
    const valuesQuotedArray = facetValues.map(s => this.quote(s)).join(', ')
    return `(CASE WHEN ${columnSql} IN (${valuesQuotedArray}) THEN ${columnSql} ELSE ${this.quote(otherValue)} END)`
  }
}
