import { kea } from 'kea'
import { put } from 'redux-saga/effects'
import PropTypes from 'prop-types'

import { push } from 'connected-react-router'

import viewsLogic from 'scenes/header/views/logic'
import stateToUrl from 'lib/explorer/state-to-url'

const arrayUniq = (array) => {
  const cache = {}
  let newArray = []
  for (var elem of array) {
    if (!cache[elem]) {
      newArray.push(elem)
    }
    cache[elem] = true
  }
  return newArray
}

export default kea({
  path: () => ['scenes', 'explorer', 'index'],

  actions: () => ({
    setConnections: connections => ({ connections }),
    setConnection: connection => ({ connection }),

    setStructure: structure => ({ structure }),

    setColumnsAndFilter: (columns, filter) => ({ columns, filter }),
    setColumns: columns => ({ columns }),
    addColumn: column => ({ column }),
    removeColumnWithIndex: index => ({ index }),
    removeColumnsWithPath: path => ({ path }),
    setTransform: (index, transform, aggregate) => ({ index, transform, aggregate }),
    setFacetsColumn: (facetsColumn) => ({ facetsColumn }),
    setFacetsCount: (facetsCount) => ({ facetsCount }),
    setGraphTimeGroup: (graphTimeGroup) => ({ graphTimeGroup }),

    setGraphControls: (graphControls) => ({ graphControls }),

    setExportTitle: (exportTitle) => ({ exportTitle }),
    urlChanged: values => (values),

    digDeeper: row => ({ row }),

    clear: true,
    refreshData: true,
    clearColumnWidths: true,

    setLoading: true,
    clearLoading: true,

    setColumnWidth: (width, key) => ({ width, key }),
    setVisibleRows: (start, end) => ({ start, end }),
    setPagination: (offset, limit) => ({ offset, limit }),
    setResults: (results, resetScrolling) => ({ results, resetScrolling }),
    setSort: (sort) => ({ sort }),

    addFilter: ({ key, value }) => ({ filter: { key, value } }),
    addEmptyFilter: (key) => ({ key }),
    removeFilter: (index) => ({ index }),
    removeFiltersByKey: (key) => ({ key }),
    setFilter: (index, filter) => ({ index, filter }),

    setGraphTimeFilter: (graphTimeFilter) => ({ graphTimeFilter }),

    openTreeNodeFilter: (path) => ({ path }),

    openTreeNode: (path) => ({ path }),
    closeTreeNode: (path) => ({ path }),
    collapseChildNodes: (path) => ({ path }),

    setSearch: (search) => ({ search }),

    requestExport: (format) => ({ format }),

    addFavouriteRequest: (path) => ({ path }),
    addFavouriteSuccess: (path, favourite) => ({ path, favourite }),
    removeFavouriteRequest: (path) => ({ path }),
    removeFavouriteSuccess: (path) => ({ path }),
    favouritesLoaded: (favourites) => ({ favourites }),

    openUrl: (url) => ({ url })
  }),

  reducers: ({ actions }) => ({
    search: ['', PropTypes.string, {
      [actions.setSearch]: (_, payload) => payload.search
    }],
    connections: [{}, PropTypes.object, {
      [actions.setConnections]: (_, payload) => {
        let newState = {}
        payload.connections.forEach(connection => {
          newState[connection.keyword] = connection
        })
        return newState
      }
    }],
    connection: [null, PropTypes.string, {
      [actions.setConnection]: (_, payload) => payload.connection,
      [actions.urlChanged]: (state, payload) => payload.connection || state
    }],
    // shape of each model
    structure: [{}, PropTypes.object, {
      [actions.setStructure]: (_, payload) => payload.structure
    }],
    // tree state
    treeNodeFilterOpen: [null, PropTypes.string, {
      [actions.openTreeNodeFilter]: (_, payload) => payload.path
    }],
    treeState: [{}, PropTypes.object, {
      [actions.openTreeNode]: (state, payload) => Object.assign({}, state, { [payload.path]: true }),
      [actions.closeTreeNode]: (state, payload) => {
        const { [payload.path]: discard, ...rest } = state // eslint-disable-line
        return rest
      },
      [actions.collapseChildNodes]: (state, payload) => {
        const collapseFrom = `${payload.path}.`
        const openNodes = Object.keys(state)
        let newState = {}
        openNodes.forEach(node => {
          if (node.indexOf(collapseFrom) === -1) {
            newState[node] = true
          }
        })
        return newState
      },
      [actions.clear]: () => ({}),
      [actions.urlChanged]: (_, payload) => payload.treeState
    }],
    // what we want the selected columns to be
    columns: [[], PropTypes.array, {
      [actions.setColumnsAndFilter]: (state, payload) => payload.columns,
      [actions.setColumns]: (state, payload) => payload.columns,
      [actions.addColumn]: (state, payload) => state.concat([payload.column]),
      [actions.removeColumnWithIndex]: (state, payload) => {
        let i = 0
        return state.filter(column => i++ !== payload.index)
      },
      [actions.removeColumnsWithPath]: (state, payload) => state.filter(column => column.split('!')[0] !== payload.path),
      [actions.setResults]: (_, payload) => payload.results.columns,
      [actions.clear]: () => [],
      [actions.urlChanged]: (_, payload) => payload.columns,
      [actions.setTransform]: (state, payload) => {
        let i = 0
        return state.map(column => payload.index === i++ ? column.split('!')[0] + (payload.transform || payload.aggregate ? `!${payload.transform || ''}` + (payload.aggregate ? `!${payload.aggregate}` || '' : '') : '') : column)
      }
    }],
    // meta for columns returned by the server
    columnsMeta: [{}, PropTypes.object, {
      [actions.setResults]: (_, payload) => payload.results.columnsMeta,
      [actions.clear]: () => ({})
    }],
    // filter set by us/server
    filter: [[], PropTypes.array, {
      [actions.setResults]: (_, payload) => payload.results.filter,
      [actions.setColumnsAndFilter]: (_, payload) => payload.filter,
      [actions.setFilter]: (state, payload) => {
        let newFilter = []

        for (let i = 0; i < state.length; i++) {
          if (i === payload.index) {
            newFilter.push({ ...state[i], value: payload.filter })
          } else {
            newFilter.push(state[i])
          }
        }

        return newFilter
      },
      [actions.addFilter]: (state, payload) => state.concat([payload.filter]),
      [actions.addEmptyFilter]: (state, payload) => state.concat([{ key: payload.key, value: '' }]),
      [actions.removeFilter]: (state, payload) => {
        let newFilter = []

        for (let i = 0; i < state.length; i++) {
          if (i !== payload.index) {
            newFilter.push(state[i])
          }
        }

        return newFilter
      },
      [actions.removeFiltersByKey]: (state, payload) => state.filter(({ key, value }) => key !== payload.key),
      [actions.clear]: () => ([]),
      [actions.urlChanged]: (_, payload) => payload.filter
    }],
    results: [[], PropTypes.array, {
      [actions.setColumns]: () => [],
      [actions.setColumnsAndFilter]: () => [],
      [actions.addColumn]: () => [],
      [actions.setResults]: (_, payload) => payload.results.results,
      [actions.clear]: () => []
    }],
    offsetTarget: [0, PropTypes.number, {
      [actions.setPagination]: (_, payload) => payload.offset
    }],
    offset: [0, PropTypes.number, {
      [actions.setResults]: (_, payload) => payload.results.offset,
      [actions.setColumns]: () => 0,
      [actions.setColumnsAndFilter]: () => 0,
      [actions.addColumn]: () => 0,
      [actions.clear]: () => 0
    }],
    limitTarget: [100, PropTypes.number, {
      [actions.setPagination]: (_, payload) => payload.limit
    }],
    limit: [100, PropTypes.number, {
      [actions.setPagination]: (_, payload) => payload.limit,
      [actions.setResults]: (_, payload) => payload.results.limit
    }],
    visibleStart: [0, PropTypes.number, {
      [actions.setVisibleRows]: (_, payload) => payload.start
    }],
    visibleEnd: [0, PropTypes.number, {
      [actions.setVisibleRows]: (_, payload) => payload.end
    }],
    count: [0, PropTypes.number, {
      [actions.setResults]: (_, payload) => payload.results.count,
      [actions.clear]: () => 0
    }],
    isSubmitting: [false, PropTypes.bool, {
      [actions.setLoading]: () => true,
      [actions.setResults]: () => false,
      [actions.clearLoading]: () => false
    }],
    sort: [null, PropTypes.string, {
      [actions.setSort]: (_, payload) => payload.sort,
      [actions.setResults]: (_, payload) => payload.results.sort,
      [actions.urlChanged]: (_, payload) => payload.sort,
      [actions.clear]: () => null
    }],
    columnWidths: [{}, PropTypes.object, {
      [actions.setColumnWidth]: (state, payload) => ({ ...state, [payload.key]: payload.width }),
      [actions.clearColumnWidths]: (_, payload) => ({}),
      [actions.clear]: (_, payload) => ({})
    }],
    // used as a bridge between a kind-of-controlled-but-also-uncontrolled fixed-data-table-2 component and the saga
    scrollingResetCounter: [0, PropTypes.number, {
      [actions.setResults]: (state, payload) => payload.resetScrolling ? state + 1 : state
    }],
    graph: [null, PropTypes.object, {
      [actions.setResults]: (_, payload) => payload.results.graph,
      [actions.clear]: () => null
    }],
    graphTimeFilter: ['last-365', PropTypes.string, {
      [actions.setGraphTimeFilter]: (_, payload) => payload.graphTimeFilter,
      [actions.urlChanged]: (state, payload) => payload.graphTimeFilter || state,
      [actions.setResults]: (state, payload) => payload.results.graphTimeFilter || state
    }],
    graphControls: [{
      type: 'area',
      sort: '123',
      cumulative: false,
      percentages: false,
      labels: false
    }, PropTypes.shape({
      type: PropTypes.oneOf(['area', 'bar', 'line']).isRequired,
      sort: PropTypes.oneOf(['123', 'abc']).isRequired,
      cumulative: PropTypes.bool,
      percentages: PropTypes.bool,
      labels: PropTypes.bool
    }), {
      [actions.setGraphControls]: (state, payload) => Object.assign({}, state, payload.graphControls),
      [actions.urlChanged]: (_, payload) => payload.graphControls,
      [actions.setResults]: (_, payload) => payload.results.graphControls
    }],
    facetsColumn: [null, PropTypes.string, {
      [actions.setFacetsColumn]: (state, payload) => payload.facetsColumn,
      [actions.urlChanged]: (state, payload) => payload.facetsColumn,
      [actions.setResults]: (state, payload) => payload.results.facetsColumn,
      [actions.removeColumnsWithPath]: (state, payload) => state && payload.path === state.split('!')[0] ? null : state,
      [actions.clear]: () => null
    }],
    facetsCount: [null, PropTypes.number, {
      [actions.setFacetsCount]: (state, payload) => payload.facetsCount,
      [actions.urlChanged]: (state, payload) => payload.facetsCount,
      [actions.setResults]: (state, payload) => payload.results.facetsCount,
      [actions.clear]: () => 6
    }],
    exportTitle: ['', PropTypes.string, {
      [actions.setExportTitle]: (state, payload) => payload.exportTitle,
      [actions.clear]: () => ''
    }],

    favourites: [{}, PropTypes.object, {
      [actions.favouritesLoaded]: (_, payload) => {
        let newState = {}
        payload.favourites.forEach(favourite => {
          newState[favourite.path] = favourite
        })
        return newState
      },
      [actions.addFavouriteSuccess]: (state, payload) => {
        const { path, favourite } = payload
        return Object.assign({}, state, { [path]: favourite })
      },
      [actions.removeFavouriteSuccess]: (state, payload) => {
        const { path } = payload
        let newState = Object.assign({}, state)
        delete newState[path]
        return newState
      }
    }]
  }),

  selectors: ({ selectors }) => ({
    models: [
      () => [selectors.structure],
      (structure) => {
        if (!structure) {
          return []
        }
        return Object.keys(structure).filter(key => structure[key].enabled)
      },
      PropTypes.array
    ],

    selectedModel: [
      () => [selectors.treeState],
      (treeState) => {
        return Object.keys(treeState).length > 0 ? Object.keys(treeState)[0].split('.')[0] : null
      },
      PropTypes.string
    ],

    modelFavourites: [
      () => [selectors.selectedModel, selectors.favourites],
      (model, favourites) => {
        if (favourites) {
          return Object.keys(favourites).filter(k => k.indexOf(model + '.') === 0).sort()
        }
        return []
      },
      PropTypes.array
    ],

    savedViews: [
      () => [selectors.selectedModel, viewsLogic.selectors.sortedViews],
      (model, sortedViews) => {
        if (sortedViews) {
          return sortedViews.filter(view => view.path.indexOf(`&columns=${model}.`) >= 0)
        }
        return []
      },
      PropTypes.array
    ],

    filteredModels: [
      () => [selectors.models, selectors.search],
      (models, search) => {
        return models.sort().filter(m => !search || m.toLowerCase().includes(search.toLowerCase()))
      },
      PropTypes.array
    ],

    graphTimeGroup: [
      () => [selectors.graph],
      (graph) => {
        if (!graph) {
          return null
        }
        return graph.timeGroup
      },
      PropTypes.oneOf(['day', 'week', 'month', 'quarter', 'year'])
    ],

    filterKeys: [
      () => [selectors.filter],
      (filter) => {
        return filter.map(f => f.key)
      },
      PropTypes.array
    ],

    url: [
      () => [
        selectors.connection, selectors.columns, selectors.sort, selectors.treeState, selectors.graphTimeFilter,
        selectors.facetsColumn, selectors.facetsCount, selectors.filter, selectors.graphControls
      ],
      (connection, columns, sort, treeState, graphTimeFilter, facetsColumn, facetsCount, filter, graphControls) => {
        return stateToUrl({
          connection: connection,
          columns: columns.join(','),
          sort: sort || '',
          treeState: Object.keys(treeState).join(','),
          graphTimeFilter: graphTimeFilter || '',
          facetsColumn: facetsColumn || '',
          facetsCount: facetsCount || '',
          graphControls: graphControls,
          filter: filter
        })
      },
      PropTypes.string
    ],

    recommendedViews: [
      () => [selectors.connection, selectors.selectedModel, selectors.structure, selectors.modelFavourites],
      (connection, selectedModel, structure, modelFavourites) => {
        if (!selectedModel) {
          return []
        }

        const modelStructure = structure[selectedModel]

        if (!modelStructure) {
          return []
        }

        const primaryKeyField = modelStructure.primary_key

        const urls = []

        urls.push({
          key: 'ids',
          name: 'count',
          url: stateToUrl({
            connection: connection,
            columns: `${selectedModel}.${primaryKeyField}!!count`,
            sort: '',
            treeState: `${selectedModel}`,
            graphTimeFilter: 'last-365',
            facetsColumn: '',
            facetsCount: 6,
            filter: [],
            graphControls: {
              type: 'area',
              sort: '123',
              cumulative: false,
              percentages: false,
              labels: false,
              compareWith: 0,
              compareWithPercentageLine: true
            }
          })
        })

        urls.push({
          key: 'all',
          name: 'all rows with favourites',
          url: stateToUrl({
            connection: connection,
            columns: arrayUniq([`${selectedModel}.${primaryKeyField}`].concat(modelFavourites || [])).join(','),
            sort: `-${selectedModel}.${primaryKeyField}`,
            treeState: `${selectedModel}`,
            graphTimeFilter: 'last-365',
            facetsColumn: '',
            facetsCount: 6,
            filter: [],
            graphControls: {
              type: 'area',
              sort: '123',
              cumulative: false,
              percentages: false,
              labels: false,
              compareWith: 0,
              compareWithPercentageLine: true
            }
          })
        })

        const createdAt = modelStructure.columns && modelStructure.columns.created_at
        if (createdAt) {
          urls.push({
            key: 'created_at',
            name: 'last 365 days',
            url: stateToUrl({
              connection: connection,
              columns: `${selectedModel}.${primaryKeyField}!!count,${selectedModel}.created_at!day`,
              sort: '',
              treeState: `${selectedModel}`,
              graphTimeFilter: 'last-365',
              facetsColumn: '',
              facetsCount: 6,
              filter: [],
              graphControls: {
                type: 'bar',
                sort: '123',
                cumulative: false,
                percentages: false,
                labels: false,
                compareWith: 0,
                compareWithPercentageLine: true
              }
            })
          })

          urls.push({
            key: 'yoy_12',
            name: '12 month y-o-y',
            url: stateToUrl({
              connection: connection,
              columns: `${selectedModel}.${primaryKeyField}!!count,${selectedModel}.created_at!month`,
              sort: '',
              treeState: `${selectedModel}`,
              graphTimeFilter: 'last-365',
              facetsColumn: '',
              facetsCount: 6,
              filter: [],
              graphControls: {
                type: 'bar',
                sort: '123',
                cumulative: false,
                percentages: false,
                labels: false,
                compareWith: 12,
                compareWithPercentageLine: true
              }
            })
          })
        }

        return urls
      },
      PropTypes.array
    ]
  }),

  takeEvery: ({ actions }) => ({
    * [actions.openUrl] (action) {
      const { url } = action.payload
      yield put(push(url))
    }
  })
})
