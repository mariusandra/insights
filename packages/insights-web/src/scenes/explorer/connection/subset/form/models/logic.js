import { kea } from 'kea'
import naturalCompare from 'string-natural-compare'

import explorerLogic from 'scenes/explorer/logic'
import connectionLogic from '../../../logic'

const arrayToObjectKeys = (arr, defaultValue = true) => {
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
    ],
    actions: [
      connectionLogic, ['openSubset', 'fullSubsetLoaded']
    ]
  },

  actions: () => ({
    setCheckedKeysRaw: (checkedKeys) => ({ checkedKeys }),
    setCheckedKeys: (checkedKeys) => ({ checkedKeys }),
    addCustomField: (model) => ({ model }),
    editColumn: (column) => ({ column }),
    closeEdit: true,
    toggle: true
  }),

  reducers: ({ actions, selectors }) => ({
    checkedKeys: [[], {
      [actions.setCheckedKeys]: (_, payload) => payload.checkedKeys,
    }],
    editingColumn: [null, {
      [actions.addCustomField]: (_, payload) => payload.model,
      [actions.editColumn]: (_, payload) => payload.column,
      [actions.closeEdit]: () => null
    }]
  }),

  selectors: ({ selectors }) => ({
    sortedModels: [
      () => [selectors.structure],
      structure => Object.keys(structure).sort(naturalCompare)
    ],
    sortedStructure: [
      () => [selectors.structure],
      (structure) => {
        const newStructure = {}
        Object.entries(structure).sort((a, b) => naturalCompare(a[0], b[0])).forEach(([model, { custom, columns, links }]) => {
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
    ],
    subsetSelection: [
      () => [selectors.sortedStructure, selectors.checkedKeysLookup, selectors.checkedModelsLookup],
      (sortedStructure, checkedKeysLookup, checkedModelsLookup) => {
        const selection = {}

        Object.entries(sortedStructure).forEach(([model, fields]) => {
          const fieldSupported = field => {
            return checkedKeysLookup[`${model}.${field.key}`] &&
              (field.type !== 'link' || checkedModelsLookup[field.meta.model])
          }

          if (!fields.some(fieldSupported)) {
            selection[model] = false
          } else {
            const fieldSelection = {}

            fields.forEach(field => {
              fieldSelection[field.key] = !!fieldSupported(field)
            })

            selection[model] = fieldSelection
          }
        })

        return selection
      }
    ],
    ignoredColumnCount: [
      () => [selectors.sortedStructure, selectors.subsetSelection],
      (sortedStructure, subsetSelection) => {
        const ignoredColumnCount = {}

        Object.entries(subsetSelection).forEach(([model, fieldStatusObject]) => {
          if (fieldStatusObject === false) {
            ignoredColumnCount[model] = 0 //sortedStructure[model].length
          } else {
            ignoredColumnCount[model] = Object.values(fieldStatusObject).filter(v => !v).length
          }
        })

        return ignoredColumnCount
      }
    ]
  }),

  listeners: ({ actions, values }) => ({
    [actions.openSubset]: () => {
      actions.setCheckedKeys(getAllFields(values.structure))
    },

    // add and remove links to models that were added/removed before saving to a reducer
    [actions.setCheckedKeysRaw]: ({ checkedKeys: newCheckedKeys }) => {
      const addedModels = []
      const removedModels = []

      const { checkedModelsLookup: oldCheckedModelsLookup, structure } = values

      const newCheckedKeysLookup = {}
      newCheckedKeys.forEach(key => newCheckedKeysLookup[key] = true)

      const newCheckedModelsLookup = {}
      newCheckedKeys.forEach(key => newCheckedModelsLookup[key.split('.')[0]] = true)

      Object.keys(oldCheckedModelsLookup).filter(model => !newCheckedModelsLookup[model]).forEach(model => {
        removedModels.push(model)
      })

      Object.keys(newCheckedModelsLookup).filter(model => !oldCheckedModelsLookup[model]).forEach(model => {
        addedModels.push(model)
      })

      let finalCheckedKeys = [...newCheckedKeys]

      addedModels.forEach(addedModel => {
        Object.entries(structure).forEach(([model, { links }]) => {
          if (newCheckedModelsLookup[model] && links) {
            Object.entries(links).forEach(([key, meta]) => {
              if (meta.model === addedModel && !newCheckedKeysLookup[`${model}.${key}`]) {
                finalCheckedKeys.push(`${model}.${key}`)
              }
            })
          }
        })
      })

      removedModels.forEach(removedModel => {
        finalCheckedKeys = finalCheckedKeys.filter(key => {
          const [model, link] = key.split('.', 2)
          return !(structure[model] && structure[model].links && structure[model].links[link] && structure[model].links[link].model === removedModel)
        })
      })

      actions.setCheckedKeys(finalCheckedKeys)
    },

    [actions.toggle]: () => {
      if (values.checkedKeys.length > 0) {
        actions.setCheckedKeys([])
      } else {
        actions.setCheckedKeys(getAllFields(values.structure))
      }
    }
  })
})
