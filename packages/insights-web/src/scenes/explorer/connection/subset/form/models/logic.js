import { kea } from 'kea'
import naturalCompare from 'string-natural-compare'

import connectionLogic from '../../../logic'

const arrayToObjectKeys = (arr, defaultValue = true) => {
  let obj = {}
  arr.forEach(a => obj[a] = defaultValue)
  return obj
}

function checkedKeysForSubsetAndStructure (subset, structure) {
  const { addNewModels, addNewFields, newFields = {}, editedFields = {} } = subset
  const selection = subset.selection || {}

  let checkedKeys = []

  Object.entries(structure).forEach(([model, modelStructure]) => {
    const skipOld = editedFields[model] ? Object.keys(editedFields[model]) : []
    const modelKeys = [
      ...Object.keys(modelStructure.columns),
      ...Object.keys(modelStructure.links),
      ...Object.keys(modelStructure.custom)
    ].filter(k => !skipOld.includes(k)).concat([
      ...(editedFields[model] ? Object.values(editedFields[model]).map(f => f.key) : []),
      ...(newFields && newFields[model] ? Object.keys(newFields[model]) : [])
    ])

    if (typeof selection[model] === 'object') {
      let allSelected = true

      modelKeys.forEach(key => {
        const keySelection = selection[model][key]
        if (keySelection === true) {
          checkedKeys.push(`${model}.${key}`)
        } else if (keySelection === false) {
          allSelected = false
        } else if (typeof keySelection === 'undefined') {
          if (addNewFields) {
            checkedKeys.push(`${model}.${key}`)
          } else {
            allSelected = false
          }
        }
      })

      if (allSelected) {
        checkedKeys.push(model)
      }
    } else if (typeof selection[model] === 'undefined' && addNewModels) {
      checkedKeys = [...checkedKeys, model, ...modelKeys.map(k => `${model}.${k}`)]
    }
  })

  checkedKeys.sort()

  return checkedKeys
}

export default kea({
  connect: {
    values: [
      connectionLogic, ['subsetStructureInput as structure']
    ],
    actions: [
      connectionLogic, ['editSubset', 'fullSubsetLoaded']
    ]
  },

  actions: () => ({
    setCheckedKeysRaw: (checkedKeys) => ({ checkedKeys }),
    setCheckedKeys: (checkedKeys) => ({ checkedKeys }),
    setEditedFields: (editedFields) => ({ editedFields }),
    setNewFields: (newFields) => ({ newFields }),

    addCustomField: (model) => ({ model }),
    editField: (model, fieldKey, editType, originalKey) => ({ model, fieldKey, editType, originalKey }),
    closeEdit: true,
    toggle: true,
    saveNewField: (model, key, type, meta) => ({ model, key, type, meta }),
    saveEditedNewField: (model, oldKey, key, type, meta) => ({ model, oldKey, key, type, meta }),
    saveEditedOldField: (model, originalKey, key, type, meta) => ({ model, originalKey, key, type, meta }),
    deleteNewField: (model, key) => ({ model, key }),
    deleteEditedField: (model, originalKey, key) => ({ model, originalKey, key }),

    showJSON: true,
    hideJSON: true
  }),

  reducers: ({ actions }) => ({
    newFields: [{}, {
      [actions.setNewFields]: (_, payload) => payload.newFields,
      [actions.saveNewField]: (state, { model, key, type, meta }) => ({
        ...state,
        [model]: {
          ...state[model],
          [key]: { key, type, meta, newField: true }
        }
      }),
      [actions.saveEditedNewField]: (state, { model, oldKey, key, type, meta }) => {
        const { [oldKey]: oldNewField, ...otherFields } = state[model]
        return {
          ...state,
          [model]: {
            ...otherFields,
            [key]: { key, type, meta, newField: true }
          }
        }
      },
      [actions.deleteNewField]: (state, { model, key }) => {
        const { [key]: oldNewField, ...otherFields } = state[model]
        return {
          ...state,
          [model]: {
            ...otherFields,
          }
        }
      }
    }],
    editedFields: [{}, {
      [actions.setEditedFields]: (_, payload) => payload.editedFields,
      [actions.saveEditedOldField]: (state, { model, originalKey, key, type, meta }) => {
        return {
          ...state,
          [model]: {
            ...(state[model] || {}),
            [originalKey]: { key, type, meta, editedField: true }
          }
        }
      },
      [actions.deleteEditedField]: (state, { model, originalKey }) => {
        const { [originalKey]: oldNewField, ...otherFields } = state[model]
        return {
          ...state,
          [model]: {
            ...otherFields,
          }
        }
      }
    }],
    checkedKeys: [[], {
      [actions.editSubset]: () => ([]),
      [actions.setCheckedKeys]: (_, payload) => payload.checkedKeys.filter(ck => ck.split('.').length >= 2).sort(),
      [actions.saveNewField]: (state, { model, key }) => state.concat([`${model}.${key}`]).sort(),
      [actions.deleteNewField]: (state, { model, key }) => state.filter(c => c !== `${model}.${key}`),
      [actions.deleteEditedField]: (state, { model, originalKey, key }) => {
        if (originalKey !== key && state.includes(`${model}.${key}`)) {
          return state.filter(c => c !== `${model}.${key}`).concat([`${model}.${originalKey}`]).sort()
        } else {
          return state
        }
      },
      [actions.saveEditedNewField]: (state, { model, oldKey, key }) => {
        if (state.includes(`${model}.${oldKey}`)) {
          return state.filter(c => c !== `${model}.${oldKey}`).concat([`${model}.${key}`]).sort()
        } else {
          return state
        }
      },
      [actions.saveEditedOldField]: (state, { model, originalKey, key }) => {
        if (state.includes(`${model}.${originalKey}`)) {
          return state.filter(c => c !== `${model}.${originalKey}`).concat([`${model}.${key}`]).sort()
        } else {
          return state
        }
      }
    }],
    editingModel: [null, {
      [actions.addCustomField]: (_, payload) => payload.model,
      [actions.editField]: (_, payload) => payload.model,
      [actions.closeEdit]: () => null,
      [actions.saveNewField]: () => null,
      [actions.deleteNewField]: () => null,
      [actions.saveEditedNewField]: () => null,
      [actions.saveEditedOldField]: () => null,
      [actions.deleteEditedField]: () => null
    }],
    editingField: [null, {
      [actions.addCustomField]: () => null,
      [actions.editField]: (_, payload) => payload.fieldKey,
      [actions.closeEdit]: () => null,
      [actions.saveNewField]: () => null,
      [actions.deleteNewField]: () => null,
      [actions.saveEditedNewField]: () => null,
      [actions.saveEditedOldField]: () => null,
      [actions.deleteEditedField]: () => null
    }],
    editingFieldType: [null, {
      [actions.addCustomField]: () => 'new',
      [actions.editField]: (_, payload) => payload.editType,
      [actions.closeEdit]: () => null,
      [actions.saveNewField]: () => null,
      [actions.deleteNewField]: () => null,
      [actions.saveEditedNewField]: () => null,
      [actions.saveEditedOldField]: () => null,
      [actions.deleteEditedField]: () => null
    }],
    showingJSON: [null, {
      [actions.showJSON]: () => true,
      [actions.hideJSON]: () => false
    }]
  }),

  selectors: ({ selectors }) => ({
    sortedModels: [
      () => [selectors.structure],
      structure => Object.keys(structure).sort(naturalCompare)
    ],
    sortedStructure: [
      () => [selectors.structure, selectors.newFields, selectors.editedFields],
      (structure, newFields, editedFields) => {
        const newStructure = {}

        Object.entries(structure).sort((a, b) => naturalCompare(a[0], b[0])).forEach(([model, { custom, columns, links }]) => {
          const skipOld = editedFields[model] ? Object.keys(editedFields[model]) : []

          newStructure[model] = [
            ...Object.entries(custom).map(([key, meta]) => ({ key, type: 'custom', meta, editType: 'old' })),
            ...Object.entries(columns).map(([key, meta]) => ({ key, type: 'column', meta, editType: 'old' })),
            ...Object.entries(links).map(([key, meta]) => ({ key, type: 'link', meta, editType: 'old' }))
          ].filter(k => !skipOld.includes(k.key)).concat([
            ...(editedFields[model] ? Object.entries(editedFields[model]).map(([originalKey, f]) => ({ ...f, originalKey, editType: 'edited' })) : []),
            ...(newFields[model] ? Object.values(newFields[model]).map(f => ({ ...f, editType: 'new' })) : [])
          ]).sort((a, b) => naturalCompare(a.key, b.key))
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
    ],
    addedColumnCount: [
      () => [selectors.sortedStructure, selectors.newFields],
      (sortedStructure, newFields) => {
        const addedColumnCount = {}

        Object.keys(sortedStructure).forEach(model => {
          addedColumnCount[model] = newFields[model] ? Object.keys(newFields[model]).length : 0
        })

        return addedColumnCount
      }
    ],
    editedColumnCount: [
      () => [selectors.sortedStructure, selectors.editedFields],
      (sortedStructure, editedFields) => {
        const editedColumnCount = {}

        Object.keys(sortedStructure).forEach(model => {
          editedColumnCount[model] = editedFields[model] ? Object.keys(editedFields[model]).length : 0
        })

        return editedColumnCount
      }
    ],
    allFields: [
      () => [selectors.sortedStructure],
      (sortedStructure) => {
        let allFields = []

        Object.entries(sortedStructure).forEach(([model, fieldsObject]) => {
          allFields = [
            ...allFields,
            ...fieldsObject.map(field => `${model}.${field.key}`)
          ]
        })

        return allFields
      }
    ],
    defaultJSON: [
      () => [selectors.newFields, selectors.editedFields, selectors.checkedKeys],
      (newFields, editedFields, checkedKeys) => JSON.stringify({
        newFields,
        editedFields,
        checkedKeys
      }, null, 2)
    ]
  }),

  listeners: ({ actions, values }) => ({
    [actions.fullSubsetLoaded]: ({ subset, structure }) => {
      const checkedKeys = checkedKeysForSubsetAndStructure(subset, structure)
      actions.setNewFields(subset.newFields || {})
      actions.setEditedFields(subset.editedFields || {})
      actions.setCheckedKeys(checkedKeys)
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
        actions.setCheckedKeys(values.allFields)
      }
    }
  })
})
