import { kea } from 'kea'
import naturalCompare from 'string-natural-compare'

import explorerLogic from 'scenes/explorer/logic'

const arrayToObjectKeys = (arr, defaultValue) => {
  let obj = {}
  arr.forEach(a => obj[a] = defaultValue)
  return obj
}

const getAllFields = (structure) => {
  let allFields = []

  Object.values(structure).forEach(model => {
    allFields = [
      ...allFields,
      model.model,
      ...Object.keys(model.columns).map(column => `${model.model}.${column}`),
      ...Object.keys(model.links).map(link => `${model.model}.${link}`),
      ...Object.keys(model.custom).map(key => `${model.model}.${key}`)
    ]
  })

  return allFields
}


export default kea({
  connect: {
    values: [
      explorerLogic, ['structure']
    ]
  },

  actions: () => ({
    setCheckedKeys: (checkedKeys) => ({ checkedKeys }),
    editColumn: (column) => ({ column }),
    closeEdit: true
  }),

  reducers: ({ actions, selectors }) => ({
    checkedKeys: [state => selectors.structure(state) ? getAllFields(selectors.structure(state)) : [], {
      [actions.setCheckedKeys]: (_, payload) => payload.checkedKeys
    }],
    editingColumn: [null, {
      [actions.editColumn]: (_, payload) => payload.column,
      [actions.closeEdit]: () => null
    }]
  }),

  selectors: ({ selectors }) => ({
    sortedModels: [
      () => [selectors.structure],
      structure => Object.keys(structure).sort()
    ],
    sortedStructure: [
      () => [selectors.structure],
      (structure) => {
        const newStructure = {}
        Object.entries(structure).forEach(([model, { custom, columns, links }]) => {
          newStructure[model] = [
            ...Object.entries(custom).map(([key, meta]) => ({ key, type: 'custom', meta })),
            ...Object.entries(columns).map(([key, meta]) => ({ key, type: 'column', meta })),
            ...Object.entries(links).map(([key, meta]) => ({ key, type: 'link', meta }))
          ].sort((a, b) => naturalCompare(a.key, b.key))
        })
        return newStructure
      }
    ],
    checkedKeysLookup: [
      () => [selectors.checkedKeys],
      (checkedKeys) => arrayToObjectKeys(checkedKeys)
    ],
    checkedModelsLookup: [
      () => [selectors.structure, selectors.checkedKeys],
      (structure, checkedKeys) => {
        const models = {}
        checkedKeys.forEach(key => models[key.split('.')[0]] = true)
        return models
      }
    ]
  })
})
