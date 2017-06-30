import Saga from 'kea/saga'
import { put, call, fork } from 'redux-saga/effects'
import messg from 'messg'
import { LOCATION_CHANGE, push } from 'react-router-redux'

import download from 'downloadjs'

import { waitUntilLogin } from '~/scenes/auth'
import explorerLogic from '~/scenes/explorer/logic'

import urlToState from 'lib/explorer/url-to-state'

import delay from 'lib/utils/delay'

import client from '~/client'

const connectionsService = client.service('api/connections')
const structureService = client.service('api/structure')
const resultsService = client.service('api/results')
const dashboardsService = client.service('api/dashboards')
const dashboardItemsService = client.service('api/dashboard-items')

function fetchBlob (params) {
  var qs = document.querySelector('meta[name=csrf-token]')

  const requestParams = {
    endpoint: 'Explorer::Controller',
    method: 'get_results',
    params: params
  }

  return window.fetch('/_kea.json', {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-Token': qs && qs.content
    },
    body: JSON.stringify(requestParams).replace(/[\u007F-\uFFFF]/g, function (c) { return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).substr(-4) }),
    credentials: 'same-origin'
  })
}

function fetchSvg () {
  // get svg element.
  var svg = document.getElementsByClassName('recharts-surface')[0]

  // get svg source.
  var serializer = new window.XMLSerializer()
  var source = serializer.serializeToString(svg)

  // // add name spaces.
  // if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
  //   source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"')
  // }
  // if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
  //   source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"')
  // }

  // // add xml declaration
  // source = '<?xml version="1.0" standalone="no"?>\r\n' + source

  // convert svg source to URI data scheme.
  return source // 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source)
}

// function downloadUrl (url) {
//   var downloadLink = document.createElement("a")
//   downloadLink.href = url
//   downloadLink.download = "newesttree.svg"
//   document.body.appendChild(downloadLink)
//   downloadLink.click()
//   document.body.removeChild(downloadLink)
// }

export default class ExplorerSaga extends Saga {
  actions = () => ([
    explorerLogic, [
      'setConnections',
      'setConnection',

      'setStructure',

      'refreshData',
      'setResults',
      'setColumns',
      'addColumn',
      'removeColumn',
      'removeColumnWithIndex',
      'removeColumnsWithPath',
      'setLoading',
      'clearLoading',
      'setFilter',
      'addFilter',
      'addEmptyFilter',
      'removeFilter',
      'removeFiltersByKey',
      'setPagination',
      'setSort',
      'setTransform',
      'openTreeNode',
      'closeTreeNode',
      'urlChanged',
      'clear',
      'digDeeper',
      'setColumnsAndFilter',
      'setGraphTimeFilter',
      'setFacetsColumn',
      'setFacetsCount',
      'setGraphCumulative',
      'setPercentages',
      'requestExport',

      'dashboardsLoaded',
      'addToDashboard'
    ]
  ])

  takeEvery = ({ actions }) => ({
    [LOCATION_CHANGE]: this.urlToStateWorker,
    [actions.digDeeper]: this.digDeeperWorker,
    [actions.setConnection]: this.setConnectionWorker
  })

  takeLatest = ({ actions }) => ({
    [actions.clear]: this.refreshDataWorker,
    [actions.urlChanged]: this.refreshDataWorker,
    [actions.setColumnsAndFilter]: this.refreshDataWorker,
    [actions.setColumns]: this.refreshDataWorker,
    [actions.addColumn]: this.refreshDataWorker,
    [actions.removeColumn]: this.refreshDataWorker,
    [actions.removeColumnWithIndex]: this.refreshDataWorker,
    [actions.removeColumnsWithPath]: this.refreshDataWorker,
    [actions.refreshData]: this.refreshDataWorker,
    [actions.setFilter]: this.refreshDataWorker,
    [actions.addFilter]: this.refreshDataWorker,
    [actions.addEmptyFilter]: this.refreshDataWorker,
    [actions.removeFilter]: this.refreshDataWorker,
    [actions.removeFiltersByKey]: this.refreshDataWorker,
    [actions.setPagination]: this.refreshDataWorker,
    [actions.setSort]: this.refreshDataWorker,
    [actions.setTransform]: this.refreshDataWorker,
    [actions.setGraphTimeFilter]: this.refreshDataWorker,
    [actions.setFacetsColumn]: this.refreshDataWorker,
    [actions.setFacetsCount]: this.refreshDataWorker,
    [actions.setGraphCumulative]: this.refreshDataWorker,
    [actions.setPercentages]: this.refreshDataWorker,
    [actions.requestExport]: this.refreshDataWorker,
    [actions.openTreeNode]: this.refreshDataWorker,
    [actions.closeTreeNode]: this.refreshDataWorker,

    [actions.addToDashboard]: this.addToDashboardWorker
  })

  run = function * () {
    const { setConnections, setConnection } = this.actions
    yield call(waitUntilLogin)

    window.document.title = 'Explorer - Insights'

    const connections = yield connectionsService.find()

    if (connections.total === 0) {
      messg.warning('Please set up a connection!', 2500)
      yield put(push('/connections'))
      return
    }

    yield put(setConnections(connections.data))

    const connectionInUrl = urlToState(window.location.search).connection
    let connection

    if (connectionInUrl && connections.data.filter(c => c.keyword === connectionInUrl).length > 0) {
      connection = connectionInUrl
    } else {
      connection = connections.data[0].keyword
    }

    yield put(setConnection(connection))

    yield fork(this.loadDashboards)
    yield call(this.loadStructure, connection)

    yield call(this.urlToStateWorker, { payload: { pathname: window.location.pathname, search: window.location.search, firstLoad: true } })
  }

  loadDashboards = function * (action) {
    const { dashboardsLoaded } = this.actions

    const response = yield dashboardsService.find()
    yield put(dashboardsLoaded(response.data))
  }

  loadStructure = function * (keyword) {
    const { setStructure } = this.actions

    try {
      const connections = yield explorerLogic.get('connections')
      const connection = connections[keyword]

      if (!connection) {
        messg.error(`Connection "${keyword}" not found!`, 2500)
        yield put(setStructure({}))
        return
      }

      const structure = yield structureService.get(connection._id)
      yield put(setStructure(structure))
    } catch (e) {
      messg.error('Error loading database structure for connection!', 2500)
    }
  }

  setConnectionWorker = function * (action) {
    const { clear } = this.actions
    const { connection } = action.payload
    const urlValues = urlToState(window.location.search)

    if (urlValues.connection !== connection) {
      yield call(this.loadStructure, connection)
      yield put(clear())
    }
  }

  refreshDataWorker = function * (action) {
    const { setResults, setPagination, setLoading, clearLoading, openTreeNode, closeTreeNode, urlChanged, requestExport } = this.actions

    if (action.type !== urlChanged.toString()) {
      yield delay(50) // throttle unless coming from an url change
    }

    const {
      connection,
      url, columns, offsetTarget, offset, limitTarget, limit, sort, filter, graphTimeFilter,
      facetsCount, facetsColumn, exportTitle, graphCumulative, percentages, graphData
    } = yield explorerLogic.fetch('connection', 'url', 'columns', 'offset', 'limit', 'offsetTarget', 'limitTarget', 'sort', 'filter', 'graphTimeFilter', 'facetsCount', 'facetsColumn', 'exportTitle', 'graphCumulative', 'percentages', 'graphData')

    // if paginating and fetching what is currently there (horizontal scroll)
    if (action.type === setPagination.toString() && action.payload.offset === offset && action.payload.limit === limit) {
      return
    }

    if (action.type !== urlChanged.toString() && `${window.location.pathname}${window.location.search}` !== url) {
      yield put(push(url))
    }

    if (action.type === openTreeNode.toString() || action.type === closeTreeNode.toString()) {
      return // nothing to reload
    }

    if (columns.length > 0) {
      try {
        const params = {
          connection,

          columns,
          sort,
          filter,

          facetsColumn,
          facetsCount,

          graphTimeFilter,
          graphCumulative,

          percentages,

          offset: offsetTarget,
          limit: limitTarget
        }

        yield put(setLoading())

        let response = null

        if (action.type === requestExport.toString()) {
          const { format } = action.payload
          response = yield fetchBlob({
            ...params,
            ...(format === 'pdf' && graphData ? { svg: fetchSvg() } : {}),
            export: format,
            exportTitle: exportTitle
          })

          if (response.ok) {
            const blob = yield response.blob()
            const disposition = response.headers.get('content-disposition') || ''
            const match = disposition.match(/filename="([^"]+)"/)
            download(blob, match[1] || `export.${format}`)
          } else {
            messg.error(response.error, 2500)
          }
          yield put(clearLoading())
        } else {
          response = yield resultsService.find({ query: params })

          if (response.success) {
            // not asking because of a pagination update
            const resetScrolling = action.type !== setPagination.toString()

            yield put(setResults(response, resetScrolling))
          } else {
            yield put(clearLoading())
            messg.error(response.error, 2500)
          }
        }
      } catch (e) {
        console.error(e)
        yield put(clearLoading())
        messg.error(`Error: ${e.message}`, 2500)
      }
    }
  }

  urlToStateWorker = function * (action) {
    const { urlChanged } = this.actions
    const { search } = action.payload

    const values = urlToState(search)

    // fetch a new structure if the connection changes
    const oldConnection = yield explorerLogic.get('connection')
    const newConnection = values.connection

    if (newConnection && newConnection !== oldConnection) {
      const connections = yield explorerLogic.get('connections')
      if (connections[newConnection]) {
        yield call(this.loadStructure, newConnection)
      } else {
        messg.error(`Connection "${newConnection}" not found!`, 2500)
      }
    }

    yield put(urlChanged(values))
  }

  digDeeperWorker = function * (action) {
    const { setColumnsAndFilter } = this.actions

    const { row } = action.payload
    const { results, columns } = yield explorerLogic.fetch('results', 'columns')

    const resultRow = results[row]

    let newFilter = []

    let newColumns = []
    let i = 0

    columns.forEach(column => {
      const [ path, transform, aggregate ] = column.split('!')

      if (aggregate) {
        newColumns.push(path + (transform ? `!${transform}` : ''))
      } else {
        newColumns.push(column)
        if (resultRow[i] === null) {
          newFilter.push({ key: column, value: 'null' })
        } else {
          newFilter.push({ key: column, value: `equals:${resultRow[i]}` })
        }
      }
      i += 1
    })

    yield put(setColumnsAndFilter(newColumns, newFilter))
  }

  addToDashboardWorker = function * (action) {
    const { id, name, path } = action.payload

    const dashboardItem = yield dashboardItemsService.create({ dashboardId: id, name, path })

    if (dashboardItem) {
      messg.success('Added!', 2500)
    }
  }
}
