import { kea } from 'kea'
import { put, fork } from 'redux-saga/effects'
import { message } from 'antd'
import { LOCATION_CHANGE, push } from 'connected-react-router'

import download from 'downloadjs'

import explorerLogic from 'scenes/explorer/logic'
import connectionsLogic from 'scenes/explorer/connection/logic'

import getMeta from 'lib/explorer/get-meta'
import urlToState from 'lib/explorer/url-to-state'

import delay from 'lib/utils/delay'

import client from 'lib/client'
import { columnToFilter } from './table/table-cell'

const resultsService = client.service('results')
const favouritesService = client.service('favourites')

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

export default kea({
  path: () => ['scenes', 'explorer', 'saga'],

  connect: {
    props: [
      connectionsLogic, [
        'connectionString',
        'connections',
        'structure'
      ]
    ],
    actions: [
      connectionsLogic, [
        'setConnectionId',
      ],
      explorerLogic, [
        'refreshData',
        'setResults',
        'setColumns',
        'addColumn',
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
        'setGraphControls',
        'requestExport',
        'setExpandedKeys',

        'addFavouriteRequest',
        'addFavouriteSuccess',
        'removeFavouriteRequest',
        'removeFavouriteSuccess',
        'favouritesLoaded',

        'setGraphTimeGroup'
      ]
    ]
  },

  takeEvery: ({ actions, workers }) => ({
    [LOCATION_CHANGE]: workers.urlToState,
    [actions.digDeeper]: workers.digDeeper
  }),

  takeLatest: ({ actions, workers }) => ({
    [actions.addColumn]: workers.addColumn,

    [actions.clear]: workers.refreshData,
    [actions.urlChanged]: workers.refreshData,
    [actions.setConnectionId]: workers.refreshData,
    [actions.setColumnsAndFilter]: workers.refreshData,
    [actions.setColumns]: workers.refreshData,
    [actions.removeColumnWithIndex]: workers.refreshData,
    [actions.removeColumnsWithPath]: workers.refreshData,
    [actions.refreshData]: workers.refreshData,
    [actions.setFilter]: workers.refreshData,
    [actions.addFilter]: workers.refreshData,
    [actions.addEmptyFilter]: workers.refreshData,
    [actions.removeFilter]: workers.refreshData,
    [actions.removeFiltersByKey]: workers.refreshData,
    [actions.setPagination]: workers.refreshData,
    [actions.setSort]: workers.refreshData,
    [actions.setTransform]: workers.refreshData,
    [actions.setGraphTimeFilter]: workers.refreshData,
    [actions.setFacetsColumn]: workers.refreshData,
    [actions.setFacetsCount]: workers.refreshData,
    [actions.setGraphControls]: workers.refreshData,
    [actions.requestExport]: workers.refreshData,
    [actions.openTreeNode]: workers.refreshData,
    [actions.closeTreeNode]: workers.refreshData,
    [actions.setExpandedKeys]: workers.refreshData,

    [actions.addFavouriteRequest]: workers.addFavouriteRequest,
    [actions.removeFavouriteRequest]: workers.removeFavouriteRequest,

    [actions.setGraphTimeGroup]: workers.setGraphTimeGroup
  }),

  events: ({ actions }) => ({
    beforeMount: () => {
      window.document.title = 'Insights Explorer'
    },
    afterMount: () => {
      actions.urlChanged(urlToState(window.location.search), true)
    }
  }),

  listeners: ({ actions, values }) => ({
    [actions.urlChanged]: ({ connection }) => {
      const { connectionString } = values

      if (connectionString !== connection) {
        const [connectionId, subsetId] = (connection || '').split('--', 2)
        actions.setConnectionId(connectionId, subsetId)
      }

      actions.refreshData(true)
    }
  }),

  start: function * () {
    yield fork(this.workers.loadFavourites)
  },

  workers: {
    loadFavourites: function * (action) {
      const { favouritesLoaded } = this.actions

      const response = yield favouritesService.find()
      yield put(favouritesLoaded(response.data))
    },

    refreshData: function * (action) {
      const { setResults, setPagination, setLoading, clearLoading, openTreeNode, closeTreeNode, setExpandedKeys, requestExport } = this.actions

      if (!action.payload.fromUrl) {
        yield delay(50) // throttle unless coming from an url change
      }

      const {
        url, columns, offsetTarget, offset, limitTarget, limit, sort, filter, graphTimeFilter,
        facetsCount, facetsColumn, exportTitle, graphControls, graph
      } = yield explorerLogic.fetch('url', 'columns', 'offset', 'limit', 'offsetTarget', 'limitTarget', 'sort', 'filter', 'graphTimeFilter', 'facetsCount', 'facetsColumn', 'exportTitle', 'graphControls', 'graph')

      const { connectionString } = yield connectionsLogic.fetch('connectionString')

      // if paginating and fetching what is currently there (horizontal scroll)
      if (action.type === setPagination.toString() && action.payload.offset === offset && action.payload.limit === limit) {
        return
      }

      if (!action.payload.fromUrl && `${window.location.pathname}${window.location.search}` !== url) {
        yield put(push(url))
      }

      if (columns.length > 0) {
        const model = columns[0].split('.')[0].split('!')[0]
        window.document.title = `${model} - Insights Explorer`
      } else {
        window.document.title = 'Insights Explorer'
      }

      if (action.type === openTreeNode.toString() || action.type === closeTreeNode.toString() || action.type === setExpandedKeys.toString()) {
        return // nothing to reload
      }

      if (columns.length > 0) {
        try {
          const params = {
            connection: connectionString || '',

            columns,
            sort,
            filter,

            facetsColumn,
            facetsCount,

            graphTimeFilter,
            graphControls,

            offset: offsetTarget,
            limit: limitTarget
          }

          yield put(setLoading())

          let response = null

          if (action.type === requestExport.toString()) {
            const { format } = action.payload
            response = yield fetchBlob({
              ...params,
              ...(format === 'pdf' && graph.results ? { svg: fetchSvg() } : {}),
              export: format,
              exportTitle: exportTitle
            })

            if (response.ok) {
              const blob = yield response.blob()
              const disposition = response.headers.get('content-disposition') || ''
              const match = disposition.match(/filename="([^"]+)"/)
              download(blob, match[1] || `export.${format}`)
            } else {
              message.error(response.error)
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
              message.error(response.error)
            }
          }
        } catch (e) {
          console.error(e)
          yield put(clearLoading())
          message.error(`Error: ${e.message}`)
        }
      }
    },

    urlToState: function * (action) {
      const { urlChanged } = this.actions
      const { search } = action.payload.location || action.payload

      const urlValues = urlToState(search)

      yield put(urlChanged(urlValues))
    },

    digDeeper: function * (action) {
      const { setColumnsAndFilter } = this.actions

      const { row } = action.payload
      const { results, columns, structure } = yield explorerLogic.fetch('results', 'columns', 'structure')

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
          if (resultRow[i] === null || resultRow[i] === undefined) {
            newFilter.push({ key: column, value: 'null' })
          } else {
            const columnMeta = getMeta(column, structure)
            newFilter.push(columnToFilter(column, columnMeta, resultRow[i]))
          }
        }
        i += 1
      })

      yield put(setColumnsAndFilter(newColumns, newFilter))
    },

    addFavouriteRequest: function * (action) {
      const { addFavouriteSuccess } = this.actions
      const { path } = action.payload

      const connectionId = yield explorerLogic.get('connectionId')
      const subsetId = yield explorerLogic.get('subsetId')
      const favourite = yield favouritesService.create({ model: path.split('.')[0], path, connectionId, subsetId })

      if (favourite) {
        yield put(addFavouriteSuccess(path, favourite))
      }
    },

    removeFavouriteRequest: function * (action) {
      const { removeFavouriteSuccess } = this.actions
      const { path } = action.payload

      const favourites = yield explorerLogic.get('favourites')
      const favourite = favourites[path]

      yield favouritesService.remove(favourite._id)

      yield put(removeFavouriteSuccess(path))
    },

    setGraphTimeGroup: function * (action) {
      const { graphTimeGroup } = action.payload
      const { setTransform } = this.actions

      const columns = yield explorerLogic.get('columns')
      const { meta } = yield explorerLogic.get('graph')
      const timeMeta = meta.filter(m => m.type === 'time')[0]

      if (timeMeta) {
        const index = columns.indexOf(timeMeta.column)

        if (index >= 0) {
          yield put(setTransform(index, graphTimeGroup, null))
        }
      }
    },

    addColumn: function * (action) {
      const { refreshData, setFacetsColumn } = this.actions
      const { column } = action.payload

      const columns = yield explorerLogic.get('columns')
      const facetsColumn = yield explorerLogic.get('facetsColumn')

      if (!facetsColumn || columns.indexOf(facetsColumn) < 0) {
        const structure = yield explorerLogic.get('structure')
        const columnMeta = getMeta(column, structure)

        if (columnMeta && columnMeta.type === 'string' && columnMeta.index !== 'primary_key') {
          yield put(setFacetsColumn(column)) // will trigger refreshData via takeLatest
          return
        }
      }

      yield put(refreshData())
    }
  }
})
