import Saga from 'kea/saga'
import { put, call, fork } from 'redux-saga/effects'
import messg from 'messg'
import { LOCATION_CHANGE, push } from 'react-router-redux'

import download from 'downloadjs'

import explorerLogic from '~/scenes/explorer/logic'

import explorerController from '~/scenes/explorer/controller.rb'
import dashboardController from '~/scenes/dashboard/controller.rb'

import urlToState from 'lib/explorer/url-to-state'

import delay from 'lib/utils/delay'

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

  run = function * () {
    const { setStructure } = this.actions

    window.document.title = 'Explorer - Insights'

    const structure = yield explorerController.getStructure()
    yield put(setStructure(structure))
    yield fork(this.loadDashboards)

    yield call(this.urlToStateWorker, { payload: { pathname: window.location.pathname, search: window.location.search, firstLoad: true } })
  }

  takeEvery = ({ actions }) => ({
    [LOCATION_CHANGE]: this.urlToStateWorker,
    [actions.digDeeper]: this.digDeeperWorker
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

  loadDashboards = function * (action) {
    const { dashboardsLoaded } = this.actions

    const { dashboards } = yield dashboardController.getDashboards({})
    yield put(dashboardsLoaded(dashboards))
  }

  refreshDataWorker = function * (action) {
    yield delay(50) // throttle

    const { setResults, setPagination, setLoading, clearLoading, openTreeNode, closeTreeNode, urlChanged, requestExport } = this.actions

    const {
      url, columns, offsetTarget, offset, limitTarget, limit, sort, filter, graphTimeFilter, facetsCount, facetsColumn, exportTitle, graphCumulative, percentages, graphData
    } = yield explorerLogic.fetch('url', 'columns', 'offset', 'limit', 'offsetTarget', 'limitTarget', 'sort', 'filter', 'graphTimeFilter', 'facetsCount', 'facetsColumn', 'exportTitle', 'graphCumulative', 'percentages', 'graphData')

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
          response = yield explorerController.getResults(params)

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
        yield put(clearLoading())
        messg.error('Error', 2500)
      }
    }
  }

  urlToStateWorker = function * (action) {
    const { urlChanged } = this.actions
    const { search } = action.payload

    const values = urlToState(search)

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
          newFilter.push({ key: column, value: `null` })
        } else {
          newFilter.push({ key: column, value: `equals:${resultRow[i]}` })
        }
      }
      i += 1
    })

    yield put(setColumnsAndFilter(newColumns, newFilter))
  }

  addToDashboardWorker = function * (action) {
    const { dashboardsLoaded } = this.actions
    const { id, name, path } = action.payload

    const results = yield dashboardController.addToDashboard({ id, name, path })

    if (results.dashboards) {
      messg.success('Added!', 2500)
      yield put(dashboardsLoaded(results.dashboards))
    } else if (results.error) {
      messg.success(results.error, 2500)
    }
  }
}
