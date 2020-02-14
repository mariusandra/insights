import { Structure, ColumnMetadata, ResultsParams, GraphResponse, ResultsResponse, TruncationType } from '../definitions.d'
import SQL from '../adapter/sql'

import moment from 'moment'

export default class Results {
  params: Partial<ResultsParams>
  structure: Structure
  adapter: SQL

  response: ResultsResponse | null = null

  baseModelName: string | null = null
  columnMetadata: ColumnMetadata[] = []
  resultsTableColumnMetadata: ColumnMetadata[] = []

  commonSqlConditions: {
    having: string[]
    where: string[]
  } = {
    having: [],
    where: []
  }

  commonSqlParts: {
    fromAndJoins: string
    where: string
    having: string
  } = {
    fromAndJoins: '',
    where: '',
    having: ''
  }

  resultsTableCount: number = 1

  resultsTableSqlParts: {
    select: string
    group: string
    sort: string
    limit: number
    offset: number
  } = {
    select: '',
    group: '',
    sort: '',
    limit: 25,
    offset: 0
  }

  finalResults: any[] = []
  graphResponse: GraphResponse | null = null

  constructor ({ params, adapter, structure } : {
    params: Partial<ResultsParams>,
    adapter: SQL
    structure: Structure
  }) {
    this.params = params
    this.adapter = adapter
    this.structure = structure
  }

  async getResponse () : Promise<ResultsResponse> {
    this.resetCache()

    // common
    this.setJoinsAndColumnMetadata()
    this.setFilter()

    // table
    this.setGroup()
    this.setSort()
    this.setLimit()

    if (!this.params.graphOnly) {
      await this.getCount()
      await this.getResults()
    }

    // graph
    if (!this.params.tableOnly) {
      await this.getGraph()
    }

    this.setResponse()

    return this.response
  }

  resetCache () {
    this.baseModelName = null
    this.columnMetadata = []
    this.resultsTableColumnMetadata = []

    this.commonSqlConditions = {
      having: [],
      where: []
    }

    this.commonSqlParts = {
      fromAndJoins: '',
      where: '',
      having: ''
    }

    this.resultsTableCount = 1

    this.resultsTableSqlParts = {
      select: '',
      group: '',
      sort: '',
      limit: 25,
      offset: 0
    }

    this.finalResults = []

    this.graphResponse = null

    this.response = null
  }

  setJoinsAndColumnMetadata () {
    // input params
    const { columns, filter } = this.params

    // are we requesting any data?
    if (!columns) {
      throw new Error('No columns selected')
    }

    // the model we're requesting must exist
    this.baseModelName = columns[0].split('.')[0]
    if (!this.structure[this.baseModelName]) {
      throw new Error(`Base model "${this.baseModelName}" not found`)
    }

    // get all the columns we must be able to access (results table + filter)
    const filterColumns = uniq(filter.map(v => v.key))
    const columnsToJoin = uniq(columns.concat(filterColumns))

    // each requested column must be for this model
    if (columnsToJoin.filter(s => s.split('.')[0] !== this.baseModelName).count > 0) {
      throw new Error('Each column must be from the same base model!')
    }

    // counters for value and table aliases
    let tableCounter = 0
    let valueCounter = 0

    // add the base model's path to the "join list"
    const baseTableName = this.structure[this.baseModelName]['table_name']
    const baseTableAlias = `$T${tableCounter}` // "$T0"

    let joins = {
      [this.baseModelName]: {
        alias: baseTableAlias,
        sql: this.adapter.fromTableAs(baseTableName, baseTableAlias) // "FROM baseTableName AS baseTableAlias"
      }
    }

    // make sure we have access to each of the columns we need
    columnsToJoin.forEach(column => {
      // each incoming column is in the format "path!transform!aggregate"
      // e.g. "Order.order_lines.created_at!month!max"
      const [ path, transform, aggregate ] = column.replace('$', '!').split('!', 3)

      // we will split the path by "." and follow the links going forward, adding joins when needed

      // always starting the traverse from the base model
      let node = this.structure[this.baseModelName]
      let tableAlias = baseTableAlias

      // log of how far we have gotten. empty at first
      let traversedPath = [this.baseModelName]

      // remove the modal from the path, so "Order.order_lines.created_at" -> "order_lines.created_at"
      let localPath = path.split('.')
      localPath.shift()

      localPath.forEach(key => {
        // if the next part of the key is a column, deal with it
        // (alternatively, if it's a link to a model, and we'll deal with it below in the "else")
        if (node.columns[key] || node.custom[key]) {
          let meta = null // from insights.yml
          let sql = null // how to access this field
          let sqlBeforeTransform = null

          // get meta and sql
          if (node.columns[key]) {
            meta = node.columns[key]
            sql = this.adapter.tableAliasWithColumn(tableAlias, key)
          } else if (node.custom[key]) {
            meta = node.custom[key]

            sql = meta.sql
            let limit = 0

            // replace keys like "${other_column}"
            while (true) {
              limit += 1
              if (limit > 100) {
                throw new Error(`Recursive loop when evalutating custom key ${traversedPath.join('.')}.${key}`)
              }

              const match = sql.match(/\${([^}]+)}/)
              if (!match) {
                break
              }

              const toReplace = match[0]
              const keyword = match[1]

              if (node.columns[keyword]) {
                sql = sql.split(toReplace).join(this.adapter.tableAliasWithColumn(tableAlias, keyword))
              }

              if (node.custom[keyword]) {
                sql = sql.split(toReplace).join(`(${node.custom[keyword].sql})`)
              }
            }

            // replace "$$." with the table name
            sql = this.adapter.customSqlInTableReplace(sql, tableAlias)
          }

          // perform date conversion if needed
          if (meta.type === 'time') {
            sql = this.adapter.convertSqlTimezone(sql)
          }

          if (transform && (meta.type === 'time' || meta.type === 'date')) {
            sqlBeforeTransform = sql
            sql = this.adapter.truncateDate(sql, transform)
          }

          // add aggregation functions (count(...), etc)
          if (aggregate) {
            sql = this.adapter.addAggregation(sql, aggregate)
          }

          const metadatumObject = {
            column: column,
            path: path,
            table: tableAlias,
            key: key,
            sql: sql,
            sqlBeforeTransform: sqlBeforeTransform,
            alias: `$V${valueCounter}`,
            type: meta.type.replace(/^:/, ''),
            url: meta.url,
            model: node.model,
            transform: transform,
            aggregate: aggregate || null,
            index: meta.index
          }

          this.columnMetadata.push(metadatumObject)

          // is this a column that is present in the results table?
          if (columns.includes(column)) {
            this.resultsTableColumnMetadata.push(metadatumObject)
          }

          valueCounter += 1

        // the current traversed node is a link to a new model (foreign key)
        } else if (node.links[key]) {
          // details of the link
          const linkMeta = node.links[key]

          // remember the node's table's alias for the join
          let lastTableAlias = tableAlias

          // take the next node
          node = this.structure[linkMeta['model']]

          // add this to the traversed path
          traversedPath.push(key)

          // if we already joined this table, reuse the old name
          if (joins[traversedPath.join('.')]) {
            tableAlias = joins[traversedPath.join('.')].alias

          // otherwise add it to the joins list
          } else {
            tableCounter += 1
            tableAlias = `$T${tableCounter}`

            joins[traversedPath.join('.')] = {
              alias: tableAlias,
              sql: this.adapter.leftJoin(node['table_name'], tableAlias, linkMeta['model_key'], lastTableAlias, linkMeta['my_key'])
            }
          }
        }
      })
    })

    // save the table "from ... join ... join ..." sql
    this.commonSqlParts.fromAndJoins = this.adapter.connectFromAndJoinsArray(Object.values(joins).map(v => v.sql))
  }

  setFilter () {
    const { filter } = this.params

    if (!filter) {
      return
    }

    let whereConditions = []
    let havingConditions = []

    filter.forEach(filterObject => {
      const column = filterObject.key
      const condition = filterObject.value
      const meta = this.columnMetadata.filter(v => v.column === column)[0]

      if (!meta) {
        return
      }

      let conditions = []

      if (condition === 'null') {
        conditions.push(this.adapter.filterEmpty(meta.sql, meta.type))
      } else if (condition === 'not null') {
        conditions.push(this.adapter.filterPresent(meta.sql, meta.type))
      } else if (condition.indexOf('in:') === 0) {
        conditions.push(this.adapter.filterIn(meta.sql, condition.substring(3)))
      } else if (condition.indexOf('not_in:') === 0) {
        conditions.push(this.adapter.filterNotIn(meta.sql, condition.substring(7)))
      } else if (meta.type === 'boolean' && condition === 'true') {
        conditions.push(this.adapter.filterEquals(meta.sql, meta.type, 'true'))
      } else if (meta.type === 'boolean' && condition === 'false') {
        conditions.push(this.adapter.filterEquals(meta.sql, meta.type, 'false'))
      } else if (condition === 'equals') {
        conditions.push(this.adapter.filterEquals(meta.sql, meta.type, ''))
      } else if (condition.indexOf('equals:') === 0) {
        conditions.push(this.adapter.filterEquals(meta.sql, meta.type, condition.substring(7)))
      } else if (condition.indexOf('contains:') === 0) {
        conditions.push(this.adapter.filterContains(meta.sql, condition.substring(9)))
      } else if (condition.indexOf('between:') === 0) {
        conditions = conditions.concat(this.adapter.filterBetween(meta.sql, condition.substring(8)))
      } else if (condition.indexOf('date_range:') === 0) {
        conditions = conditions.concat(this.adapter.filterDateRange(meta.sql, condition.substring(11)))
      }

      if (meta.aggregate) {
        havingConditions = havingConditions.concat(conditions)
      } else {
        whereConditions = whereConditions.concat(conditions)
      }
    })

    this.commonSqlConditions.where = whereConditions
    this.commonSqlConditions.having = havingConditions

    if (whereConditions.length > 0) {
      this.commonSqlParts.where = this.adapter.where(whereConditions)
    }

    if (havingConditions.length > 0) {
      this.commonSqlParts.having = this.adapter.having(havingConditions)
    }
  }

  setGroup () {
    const aggregateColumns = this.resultsTableColumnMetadata.filter(v => v.aggregate)
    if (aggregateColumns.length === 0) {
      return
    }

    const groupParts = this.resultsTableColumnMetadata.filter(v => !v.aggregate).map(v => v.sql)
    if (groupParts.length === 0) {
      return
    }

    this.resultsTableSqlParts.group = this.adapter.groupBy(groupParts)
  }

  setSort () {
    let sortColumn = this.params.sort
    let sortDescending = false

    if (sortColumn && sortColumn.indexOf('-') === 0) {
      sortColumn = sortColumn.substring(1)
      sortDescending = true
    }

    let sortParts = []

    // add the requested sort column into sortParts, if it's something we have access to
    if (sortColumn) {
      const sortValue = this.columnMetadata.filter(v => v.column === sortColumn)[0]
      if (sortValue && sortValue.sql) {
        sortParts.push(this.adapter.orderPart(sortValue.sql, sortDescending))
      }
    }

    // also add the primary key of the base model to the list, to keep the results table stable
    // otherwise when scrolling things can shift around annoyingly
    const baseTableAlias = '$T0' // hardcoded for now
    const firstPrimary = (Object.entries(this.structure[this.baseModelName]['columns']).filter(([k, v]) => v['index'] === 'primary_key')[0] || [])[0]
    const noAggregate = this.columnMetadata.filter(v => v.aggregate).length === 0

    if (firstPrimary && noAggregate) {
      const columnSql = this.adapter.tableAliasWithColumn(baseTableAlias, firstPrimary)
      sortParts.push(this.adapter.orderPart(columnSql, false))
    }

    if (sortParts.length === 0) {
      return
    }

    this.resultsTableSqlParts.sort = this.adapter.orderBy(sortParts)
  }

  setLimit () {
    this.resultsTableSqlParts.offset = this.params.offset || 0
    this.resultsTableSqlParts.limit = this.params.limit || 25

    if (this.params.export === 'xlsx') {
      this.resultsTableSqlParts.offset = 0
      this.resultsTableSqlParts.limit = 65535
    }
  }

  async getCount () {
    const nonAggregateColumns = this.columnMetadata.filter(v => !v.aggregate)

    if (nonAggregateColumns.length === 0) {
      return
    }

    this.resultsTableCount = await this.adapter.getCount({
      fromAndJoins: this.commonSqlParts.fromAndJoins,
      where: this.commonSqlParts.where,
      having: this.commonSqlParts.having,
      group: this.resultsTableSqlParts.group
    })
  }

  async getResults () {
    // set what to select
    this.resultsTableSqlParts.select = this.adapter.valueListToSelect(this.resultsTableColumnMetadata)

    // get the results from the database
    const results = await this.adapter.getResults(Object.assign({}, this.commonSqlParts, this.resultsTableSqlParts))

    // get the keys used in the results
    const columnAliases = this.resultsTableColumnMetadata.map(v => v.alias)

    // convert to an array
    this.finalResults = results.map(row => columnAliases.map(a => row[a]))
  }

  async getGraph () {
    const graphTimeFilter = this.params.graphTimeFilter || 'last-60'
    const { cumulative, prediction } = this.params.graphControls

    const facetsCount = this.params.facetsCount || 6
    const facetsColumnKey = this.params.facetsColumn

    // see what we have to work with
    let timeColumns = this.resultsTableColumnMetadata.filter(v => (v.type === 'time' || v.type === 'date') && !v.aggregate)
    const aggregateColumns = this.resultsTableColumnMetadata.filter(v => v.aggregate)

    // must have at least 1 aggregate and exactly 1 time column
    if (aggregateColumns.length < 1 || timeColumns.length !== 1) {
      return
    }

    // day? week? month?
    const timeGroup: TruncationType = timeColumns[0].transform || 'day'

    const compareWith = this.params.graphControls.compareWith || 0

    // start and end of the graph timeline (or nil)
    let [firstDate, lastDate] = getTimesFromString(graphTimeFilter, 0, timeGroup)

    let compareWithFirstDate
    let compareWithLastDate

    if (compareWith && firstDate && lastDate) {
      compareWithFirstDate = moment(firstDate).subtract(compareWith, timeGroup).startOf(timeGroup).format('YYYY-MM-DD')
      compareWithLastDate = moment(lastDate).subtract(compareWith, timeGroup).endOf(timeGroup).format('YYYY-MM-DD')
    }

    let predictionFirstDate
    let predictionLastDate

    const rightNow = new Date()

    // prediction enabled and we are showing the last month of the time period
    if (compareWith && prediction && moment(lastDate).startOf(timeGroup).isBefore(rightNow) && moment(lastDate).endOf(timeGroup).isAfter(rightNow)) {
      const startOf = moment(rightNow).startOf(timeGroup).valueOf()
      const endOf = moment(rightNow).endOf(timeGroup).valueOf()
      const current = moment(rightNow).valueOf()

      const percentage = (current - startOf) / (endOf - startOf)

      const predictionStart = moment(compareWithLastDate).startOf(timeGroup).valueOf()
      const predictionEnd = moment(compareWithLastDate).endOf(timeGroup).valueOf()

      const predictionCurrent = moment(percentage * (predictionEnd - predictionStart) + predictionStart)

      predictionFirstDate = moment(predictionStart).format('YYYY-MM-DD')
      predictionLastDate = moment(predictionCurrent).format('YYYY-MM-DD')
    }

    // add the date truncation transform to the columns if none present
    timeColumns = timeColumns.map(v => (
      Object.assign({}, v, { transform: timeGroup, sql: this.adapter.truncateDate(v.sqlBeforeTransform || v.sql, timeGroup) })
    ))

    const timeColumn = timeColumns[0]

    // sort by time
    const graphSortParts = [this.adapter.orderPart(timeColumn.sql, false)]
    const graphSortSql = this.adapter.orderBy(graphSortParts)

    // limit the results to what's visible on the graph
    let graphWhereConditions = this.commonSqlConditions.where.slice(0)
    if (firstDate && lastDate) {
      graphWhereConditions = graphWhereConditions.concat(this.adapter.filterDateRange(timeColumn.sql, `${firstDate}:${lastDate}`))
    }
    const graphWhereSql = this.adapter.where(graphWhereConditions)

    let compareWithWhereSql

    if (compareWith) {
      let compareWithWhereConditions = this.commonSqlConditions.where.slice(0)
      if (compareWithFirstDate && compareWithLastDate) {
        compareWithWhereConditions = compareWithWhereConditions.concat(this.adapter.filterDateRange(timeColumn.sql, `${compareWithFirstDate}:${compareWithLastDate}`))
      }
      compareWithWhereSql = this.adapter.where(compareWithWhereConditions)
    }

    let predictionWhereSql

    if (predictionFirstDate && predictionLastDate) {
      let predictionWhereConditions = this.commonSqlConditions.where.slice(0)
      if (predictionFirstDate && predictionLastDate) {
        predictionWhereConditions = predictionWhereConditions.concat(this.adapter.filterDateRange(timeColumn.sql, `${predictionFirstDate}:${predictionLastDate}`))
      }
      predictionWhereSql = this.adapter.where(predictionWhereConditions)
    }

    // facets column
    let facetsColumn = null
    let facetsColumns = []

    if (facetsColumnKey) {
      facetsColumns = this.resultsTableColumnMetadata
        .filter(v => ['string', 'boolean'].includes(v.type) && !v.aggregate && v.column === facetsColumnKey)
        .slice(0, 1)
      facetsColumn = facetsColumns[0]
    }

    let facetValues = []

    // grouping
    let graphGroupParts = timeColumns.concat(aggregateColumns).concat(facetsColumns).filter(v => !v.aggregate).map(v => v.sql)
    let graphGroupSql = this.adapter.groupBy(graphGroupParts)

    // if we're faceting, see if we need to limit the facets
    if (facetsColumn) {
      const { values: facetValuesInner, hasOther } = await this.adapter.getFacetValuesAndHasOther({
        column: facetsColumn.sql,
        fromAndJoins: this.commonSqlParts.fromAndJoins,
        where: graphWhereSql,
        group: graphGroupSql,
        having: this.commonSqlParts.having,
        limit: facetsCount
      })

      facetValues = facetValuesInner

      // there are no values in the column, remove the facets
      if (!facetValues || facetValues.length === 0) {
        facetsColumn = null
        facetsColumns = []

      // there are values. do we have all of them, or must we add an "other"?
      } else if (facetsColumn.type === 'string' && hasOther) {
        const facetOther = facetValues.includes('Other') ? '__OTHER__' : 'Other'
        facetsColumn = Object.assign({}, facetsColumn, {
          sql: this.adapter.facetedValuesOrOther(facetsColumn.sql, facetValues, facetOther)
        })
        facetsColumns = [facetsColumn]
        facetValues.push(facetOther)
      }
    }

    // regroup in case something changed
    graphGroupParts = timeColumns.concat(aggregateColumns).concat(facetsColumns).filter(v => !v.aggregate).map(v => v.sql)
    graphGroupSql = this.adapter.groupBy(graphGroupParts)

    // graph results
    const graphSelectValues = timeColumns.concat(aggregateColumns).concat(facetsColumns)
    const graphSelectSql = this.adapter.valueListToSelect(graphSelectValues)

    // raw results from sql
    const graphResults = await this.adapter.getResults({
      select: graphSelectSql,
      fromAndJoins: this.commonSqlParts.fromAndJoins,
      where: graphWhereSql,
      group: graphGroupSql,
      having: this.commonSqlParts.having,
      sort: graphSortSql,
      limit: 10000,
      offset: 0
    })

    let compareWithHash = {}

    if (compareWith) {
      const compareWithResults = await this.adapter.getResults({
        select: graphSelectSql,
        fromAndJoins: this.commonSqlParts.fromAndJoins,
        where: compareWithWhereSql,
        group: graphGroupSql,
        having: this.commonSqlParts.having,
        sort: graphSortSql,
        limit: 10000,
        offset: 0
      })

      compareWithResults.forEach(result => {
        // TODO: should we do someting special with columns that have no date?
        if (!result[timeColumn.alias]) {
          return
        }

        let date = moment(result[timeColumn.alias]).format('YYYY-MM-DD')
        if (!compareWithHash[date]) {
          compareWithHash[date] = {}
        }

        aggregateColumns.forEach(aggregateColumn => {
          let key = `compareWith::${aggregateColumn.column}`
          facetsColumns.forEach(column => {
            key += `$$${result[column.alias]}`
          })
          compareWithHash[date][key] = result[aggregateColumn.alias]
        })
      })

      if (predictionWhereSql) {
        const predictionResults = await this.adapter.getResults({
          select: graphSelectSql,
          fromAndJoins: this.commonSqlParts.fromAndJoins,
          where: predictionWhereSql,
          group: graphGroupSql,
          having: this.commonSqlParts.having,
          sort: graphSortSql,
          limit: 10000,
          offset: 0
        })

        predictionResults.forEach(result => {
          if (!result[timeColumn.alias]) {
            return
          }

          let date = moment(result[timeColumn.alias]).format('YYYY-MM-DD')
          if (!compareWithHash[date]) {
            compareWithHash[date] = {}
          }

          aggregateColumns.forEach(aggregateColumn => {
            compareWithHash[date]['__hasCompareWithPartial'] = true
            let key = `compareWithPartial::${aggregateColumn.column}`
            facetsColumns.forEach(column => {
              key += `$$${result[column.alias]}`
            })
            compareWithHash[date][key] = result[aggregateColumn.alias]
          })
        })
      }
    }

    // save the results in a hash with dates as keys... and all aggregate columns with facets as values
    let resultHash = {}

    graphResults.forEach(result => {
      // TODO: should we do someting special with columns that have no date?
      if (!result[timeColumn.alias]) {
        return
      }

      let date = moment(result[timeColumn.alias]).format('YYYY-MM-DD')
      if (!resultHash[date]) {
        resultHash[date] = { time: date }
      }

      aggregateColumns.forEach(aggregateColumn => {
        let key = aggregateColumn.column
        facetsColumns.forEach(column => {
          key += `$$${result[column.alias]}`
        })
        resultHash[date][key] = result[aggregateColumn.alias]
      })
    })

    // each hash in the resultHash should have allKeys set
    let allKeys = []
    aggregateColumns.forEach(aggregateColumn => {
      const { column } = aggregateColumn
      if (facetValues.length > 0) {
        facetValues.forEach(v => {
          allKeys.push(`${column}$$${v}`)
        })
      } else {
        allKeys.push(column)
      }
    })

    // get the first and last dates if not already set
    if (!firstDate || !lastDate) {
      const allDateKeys = Object.keys(resultHash).sort()
      if (!firstDate) {
        firstDate = allDateKeys[0]
      }
      if (!lastDate) {
        lastDate = allDateKeys[allDateKeys.length - 1]
      }
    }

    // calculate all the dates that should be in the results
    let allDates = []
    if (firstDate && lastDate) {
      let lastTime = moment(lastDate)

      for (let date = moment(firstDate); date <= lastTime; date = date.add(1, 'day')) {
        // could be optimised... but whatever, it's not going to be a huge loop
        if (timeGroup === 'year' && (date.date() !== 1 || date.month() !== 0)) {
          continue
        }
        if (timeGroup === 'quarter' && !(date.date() === 1 && [0, 3, 6, 9].includes(date.month()))) {
          continue
        }
        if (timeGroup === 'month' && date.date() !== 1) {
          continue
        }
        if (timeGroup === 'week' && date.weekday() !== 1) {
          continue
        }

        allDates.push(date.format('YYYY-MM-DD'))
      }
    }

    // make sure all the dates have all the values present (as 0 if nil)
    if (allDates.length > 0) {
      let emptyHash = {}
      allKeys.forEach(key => {
        emptyHash[key] = 0
      })

      allDates.forEach(date => {
        resultHash[date] = Object.assign({ time: date }, emptyHash, resultHash[date] || {})
      })
    }

    if (compareWith) {
      Object.keys(resultHash).forEach(date => {
        const compareWithDate = moment(date).subtract(compareWith, timeGroup).format('YYYY-MM-DD')
        const compareWithResult = compareWithHash[compareWithDate]

        if (compareWithResult) {
          resultHash[date] = Object.assign({}, resultHash[date], compareWithResult)
        }
      })
    }

    // if we're asking for a cumulative response, sum all the values
    if (cumulative) {
      let countHash = {}
      allKeys.forEach(key => {
        countHash[key] = 0

        if (compareWith) {
          const compareWithKey = `compareWith::${key}`
          countHash[compareWithKey] = 0
        }
      })

      allDates.forEach(date => {
        allKeys.forEach(key => {
          countHash[key] += parseFloat(resultHash[date][key]) || 0
          resultHash[date][key] = countHash[key]

          if (compareWith) {
            const compareWithKey = `compareWith::${key}`
            countHash[compareWithKey] += parseFloat(resultHash[date][compareWithKey]) || 0
            resultHash[date][compareWithKey] = countHash[compareWithKey]
          }
        })
      })
    }

    this.graphResponse = {
      meta: graphSelectValues.map(values => {
        const { column, path, type, url, key, model, aggregate, transform, index } = values
        return { column, path, type, url, key, model, aggregate, transform, index }
      }),
      keys: allKeys,
      facets: facetValues,
      results: Object.keys(resultHash).sort().map(key => resultHash[key]),
      timeGroup: timeGroup
    }
  }

  setResponse () {
    let columnsMeta = {}
    this.columnMetadata.forEach(values => {
      const { column, path, type, url, key, model, aggregate, transform, index } = values
      columnsMeta[column] = { column, path, type, url, key, model, aggregate, transform, index }
    })

    this.response = {
      success: true,

      columns: this.resultsTableColumnMetadata.map(v => v.column),
      columnsMeta: columnsMeta,
      results: this.finalResults,
      count: this.resultsTableCount,
      offset: this.resultsTableSqlParts.offset,
      limit: this.resultsTableSqlParts.limit,

      sort: this.params.sort,
      filter: this.params.filter,

      graph: this.graphResponse,

      facetsColumn: this.params.facetsColumn || null,
      facetsCount: this.params.facetsCount,
      graphTimeFilter: this.params.graphTimeFilter || 'last-60',

      graphControls: this.params.graphControls
    }
  }
}

// convert 'last-365', etc to start and end dates
function getTimesFromString (timeFilter, smooth = 0, timeGroup = 'day') {
  let firstDate
  let lastDate

  if (timeFilter.match(/^20[0-9][0-9]$/)) {
    const year = parseInt(timeFilter)
    firstDate = moment(`${year}-01-01`).add(-smooth, 'days')
    lastDate = moment(`${year + 1}-01-01`).add(-1, 'day')
  } else if (timeFilter === 'this-month-so-far') {
    firstDate = moment().startOf('month')
    lastDate = moment()
  } else if (timeFilter === 'today') {
    firstDate = moment()
    lastDate = moment()
  } else if (timeFilter === 'yesterday') {
    firstDate = moment().add(-1, 'day')
    lastDate = moment().add(-1, 'day')
  } else if (timeFilter === 'this-month') {
    firstDate = moment().startOf('month')
    lastDate = moment().endOf('month')
  } else if (timeFilter === 'last-month') {
    firstDate = moment().startOf('month').add(-1, 'month')
    lastDate = moment(firstDate).endOf('month')
  } else if (timeFilter.match(/^last-([0-9]+)$/)) {
    let dayCount = parseInt(timeFilter.split('last-')[1]) + smooth
    firstDate = moment().add(-dayCount, 'days')
    if (timeGroup === 'month') {
      firstDate = moment(firstDate).startOf('month')
    } else if (timeGroup === 'week') {
      const wday = firstDate.day()
      firstDate = moment(firstDate).add(-(wday === 0 ? 6 : wday - 1), 'days')
    }
    lastDate = moment()
  } else if (timeFilter.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}-to-[0-9]{4}-[0-9]{2}-[0-9]{2}$/)) {
    const parts = timeFilter.split('-to-').map(t => moment(t))
    firstDate = parts[0]
    lastDate = parts[1]
  }

  if (!firstDate || !lastDate) {
    return []
  }

  return [firstDate.format('YYYY-MM-DD'), lastDate.format('YYYY-MM-DD')]
}

function uniq (array) {
  let tracker = {}
  return array.filter(a => {
    const notFound = !tracker[a]
    tracker[a] = true
    return notFound
  })
}
