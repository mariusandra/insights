import { kea } from 'kea'
import { put } from 'redux-saga/effects'
import PropTypes from 'prop-types'

import { push } from 'connected-react-router'

import connectionLogic from './connection/logic'
import viewsLogic from 'scenes/header/views/logic'
import stateToUrl from 'lib/explorer/state-to-url'
import naturalCompare from 'string-natural-compare'
import { getSortedMeta } from 'lib/explorer/get-sorted-meta'

export default kea({
  path: () => ['scenes', 'explorer', 'index'],

  connect: {
    actions: [
      connectionLogic, ['setConnections', 'setConnectionId']
    ],
    values: [
      viewsLogic, ['sortedViews'],
      connectionLogic, ['connections', 'connectionId', 'subsetId', 'structure', 'connectionString']
    ]
  },

  actions: () => ({
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
    urlChanged: (values, initialLoad = false) => ({ ...values, initialLoad }),

    digDeeper: row => ({ row }),

    clear: true,
    refreshData: (fromUrl = false) => ({ fromUrl }),
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

    openModel: model => ({ model }),
    closeModel: true,
    focusSearch: true,
    openTreeNodeFilter: (path) => ({ path }),

    fieldClicked: (field, path) => ({ field, path }),
    treeClicked: (path) => ({ path }),
    setExpandedKeys: (expandedKeys) => ({ expandedKeys }),
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
    // tree state
    treeNodeFilterOpen: [null, PropTypes.string, {
      [actions.openTreeNodeFilter]: (_, payload) => payload.path
    }],
    treeState: [{}, PropTypes.object, {
      [actions.setExpandedKeys]: (_, { expandedKeys }) => {
        const expandedObject = {}
        for (const key of expandedKeys) {
          expandedObject[key] = true
        }
        return expandedObject
      },
      [actions.openTreeNode]: (state, payload) => Object.assign({}, state, { [payload.path]: true }),
      [actions.closeTreeNode]: (state, payload) => {
        const newTreeState = {}
        Object.keys(state).filter(path => path !== payload.path && path.indexOf(`${payload.path}.`) !== 0).forEach(s => {
          newTreeState[s] = true
        })
        if (payload.path.split('.').length === 1) {
          newTreeState[payload.path] = false
        }
        return newTreeState
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
    sortedStructure: [
      () => [selectors.structure],
      (structure) => {
        const newStructure = {}

        Object.entries(structure).sort((a, b) => naturalCompare(a[0], b[0])).forEach(([model, { custom, columns, links }]) => {
          const fields = [
            ...Object.entries(custom).map(([key, meta]) => ({ key, type: 'custom', meta, editType: 'old' })),
            ...Object.entries(columns).map(([key, meta]) => ({ key, type: 'column', meta, editType: 'old' })),
            ...Object.entries(links).map(([key, meta]) => ({ key, type: 'link', meta, editType: 'old' }))
          ].sort((a, b) => naturalCompare(a.key, b.key))

          newStructure[model] = fields.filter(f => f.meta.index === 'primary_key').concat(fields.filter(f => f.meta.index !== 'primary_key'))
        })

        return newStructure
      }
    ],

    sortedStructureObject: [
      () => [selectors.sortedStructure],
      (sortedStructure) => {
        const newStructure = {}

        Object.entries(sortedStructure).forEach(([model, structure]) => {
          const newModelStructure = {}
          Object.values(structure).forEach(field => {
            newModelStructure[field.key] = { ...field, model }
          })
          newStructure[model] = newModelStructure
        })
        return newStructure
      }
    ],

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

    expandedKeys: [
      () => [selectors.treeState],
      (treeState) => Object.keys(treeState),
      PropTypes.string
    ],

    selectedModel: [
      () => [selectors.treeState, selectors.columns, selectors.sort],
      (treeState, columns, sort) => {
        return ((sort && sort.indexOf('-') === 0 ? sort.substring(1) : sort) || '').split('.')[0] || // columnFromSort
               (Object.keys(treeState).length > 0 ? Object.keys(treeState)[0].split('.')[0] : null) || // columnFromTreeState
               (columns.length > 0 ? columns[0].split('.')[0] : null) // columnFromColumns
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
      () => [selectors.connectionId, selectors.subsetId, selectors.selectedModel, selectors.sortedViews],
      (connectionId, subsetId, model, sortedViews) => {
        if (sortedViews) {
          return sortedViews.filter(view => view.connectionId === connectionId &&
                                            view.subsetId === subsetId &&
                                            view.path.indexOf(`&columns=${model}.`) >= 0)
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
        selectors.connectionString, selectors.columns, selectors.sort, selectors.treeState, selectors.graphTimeFilter,
        selectors.facetsColumn, selectors.facetsCount, selectors.filter, selectors.graphControls
      ],
      (connectionString, columns, sort, treeState, graphTimeFilter, facetsColumn, facetsCount, filter, graphControls) => {
        return stateToUrl({
          connection: connectionString,
          columns: columns,
          sort: sort || '',
          treeState: treeState,
          graphTimeFilter: graphTimeFilter || '',
          facetsColumn: facetsColumn || '',
          facetsCount: facetsCount || '',
          graphControls: graphControls,
          filter: filter
        })
      },
      PropTypes.string
    ]
  }),

  takeEvery: ({ actions }) => ({
    * [actions.openUrl] (action) {
      const { url } = action.payload
      yield put(push(url))
    }
  }),

  listeners: ({ actions, values }) => ({
    [actions.openModel]: async ({ model }) => {
      actions.openTreeNode(model)
      actions.setSearch('')

      // get the id column for this model
      const { structure } = values
      const primaryKey = structure[model].primary_key

      // and add it with a count as the default
      if (primaryKey) {
        actions.addColumn(`${model}.${primaryKey}!!count`)
      }
      actions.focusSearch()
    },

    [actions.closeModel]: async () => {
      actions.clear()
      actions.setSearch('')
      actions.focusSearch()
    },

    [actions.focusSearch]: async () => {
      const search = document.getElementById('sidebar-model-field-search')
      search && search.focus()
    },

    [actions.treeClicked]: async ({ path }) => {
      if (!path || path.indexOf('...') === 0) {
        return
      }

      const field = getSortedMeta(path, values.sortedStructureObject)

      if (!field || field.type !== 'link') {
        return
      }

      if (values.treeState[path]) {
        actions.closeTreeNode(path)
      } else {
        actions.openTreeNode(path)
      }
    },
    [actions.fieldClicked]: async ({ field, path }) => {
      if (field.type === 'link') {
        return
      }

      const { columns } = values
      const isSelected = columns.includes(path) || columns.some(s => s.indexOf(`${path}.`) >= 0) || columns.some(s => s.indexOf(`${path}!`) >= 0)

      if (isSelected) {
        actions.removeColumnsWithPath(path)
      } else {
        if (field.meta && field.meta.type === 'time') {
          const column = `${path}!day`
          actions.addColumn(column)
          actions.setSort(`-${column}`)
        } else {
          actions.addColumn(path)
        }

        actions.setSearch('')
      }

      actions.focusSearch()
    }
  })
})
