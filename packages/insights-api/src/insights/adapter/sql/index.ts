import { ColumnType, TruncationType, AggregationType, ColumnMetadata, SqlQueryResponse } from '../../definitions.d'

import moment from 'moment'

import { defaultTimezone } from '../../../config'

export default class SQL {
  connection: string
  timeout: number
  timezone: string

  constructor (connection: string, timeout: number, timezone: string) {
    this.connection = connection
    this.timeout = timeout
    this.timezone = timezone || defaultTimezone
  }

  async test () {
    return !!(await this.execute('select now()'))
  }

  quote (string: string) {
    // TODO: make safe
    return `"${string}"`
  }

  execute (sql: string) : Promise<SqlQueryResponse> {
    throw new Error('execute(sql) needs to be overridden!')
  }

  allowedDateTruncations () {
    return ['hour', 'day', 'week', 'month', 'quarter', 'year']
  }

  allowedAggregations () {
    return ['count', 'sum', 'min', 'max', 'avg']
  }

  fromTableAs (tableName: string, tableAlias: string) {
    return `FROM "${tableName}" AS "${tableAlias}"`
  }

  tableAliasWithColumn (tableAlias: string, column: string) {
    return `"${tableAlias}"."${column}"`
  }

  quotedColumnAlias (column: string) {
    return `"${column}"`
  }

  customSqlInTableReplace (sql: string, tableAlias: string) {
    return (sql || '').split('$$.').join(`"${tableAlias}".`)
  }

  convertSqlTimezone (sql: string) {
    return sql
  }

  truncateDate (sql: string, truncation: TruncationType) {
    if (!this.allowedDateTruncations().includes(truncation)) {
      throw new Error(`Bad date truncation '${truncation}'`)
    }
    return sql
  }

  addAggregation (sql: string, aggregation: AggregationType) {
    if (!this.allowedAggregations().includes(aggregation)) {
      throw new Error(`Bad aggregation function '${aggregation}'`)
    }

    if (aggregation === 'count') {
      return `count(distinct ${sql})`
    } else {
      return `${aggregation}(${sql})`
    }
  }

  leftJoin (tableName: string, tableAlias: string, tableKey: string, otherAlias: string, otherKey: string) {
    return `LEFT JOIN "${tableName}" "${tableAlias}" ON ("${tableAlias}"."${tableKey}" = "${otherAlias}"."${otherKey}")`
  }

  connectFromAndJoinsArray (array: string[]) {
    return array.join(' ')
  }

  filterEmpty (sql: string, type: ColumnType) {
    if (type === 'string') {
      return `((${sql}) IS NULL OR (${sql}) = '')`
    } else {
      return `(${sql}) IS NULL`
    }
  }

  filterPresent (sql: string, type: ColumnType) {
    if (type === 'string') {
      return `((${sql}) IS NOT NULL AND (${sql}) != '')`
    } else {
      return `(${sql}) IS NOT NULL`
    }
  }

  filterIn (sql: string, string: string) {
    return `(${sql}) in (${string.split(/, ?/).map(s => this.quote(s)).join(', ')})`
  }

  filterNotIn (sql: string, string: string) {
    return `(${sql}) not in (${string.split(/, ?/).map(s => this.quote(s)).join(', ')})`
  }

  filterEquals (sql: string, type: ColumnType, string: string) {
    return `(${sql}) = ${this.quote(string)}`
  }

  filterContains (sql: string, string: string) {
    return `(${sql}) like ${this.quote('%' + string + '%')}`
  }

  filterBetween (sql: string, string: string) {
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

  filterDateRange (sql: string, string: string) {
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

  where (conditionsArray: string[]) {
    if (conditionsArray.length > 0) {
      return `WHERE ${conditionsArray.join(' AND ')}`
    } else {
      return ''
    }
  }

  having (conditionsArray: string[]) {
    if (conditionsArray.length > 0) {
      return `HAVING ${conditionsArray.join(' AND ')}`
    } else {
      return ''
    }
  }

  groupBy (groupPartsArray: string[]) {
    if (groupPartsArray.length > 0) {
      return `GROUP BY ${groupPartsArray.join(',')}`
    } else {
      return ''
    }
  }

  orderPart (sql: string, descending: boolean) {
    return `${sql} ${descending ? 'DESC' : 'ASC'}`
  }

  orderBy (orderPartsArray: string[]) {
    if (orderPartsArray.length > 0) {
      return `ORDER BY ${orderPartsArray.join(',')}`
    } else {
      return ''
    }
  }

  valueListToSelect (valueList: ColumnMetadata[]) {
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

  async getResults ({ select = '', fromAndJoins = '', where = '', group = '', having = '', sort = '', limit = 25, offset = 0 }) {
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

    return { values: valuesToReturn, hasOther }
  }

  facetedValuesOrOther (columnSql: string, facetValues: string[], otherValue: string) {
    const valuesQuotedArray = facetValues.map(s => this.quote(s)).join(', ')
    return `(CASE WHEN ${columnSql} IN (${valuesQuotedArray}) THEN ${columnSql} ELSE ${this.quote(otherValue)} END)`
  }
}
