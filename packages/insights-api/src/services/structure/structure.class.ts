import { Id, Params, ServiceMethods } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Structure as IStructure } from '../../insights/definitions.d'
import getStructure from '../../insights/structure'
import { SubsetData } from '../subsets/subsets.class'

interface ServiceOptions {}

function applySubsetToStructure (structure: IStructure, subset: SubsetData) {
  const { selection = {}, addNewModels, addNewFields, newFields = {}, editedFields = {} } = subset

  const newStructure = {}

  Object.entries(structure).forEach(([modelKey, modelStructure]) => {
    if (selection[modelKey]) {
      const newModel = {
        ...modelStructure,
        links: {},
        columns: {},
        custom: {}
      };

      const skipOldEditedFields = editedFields[modelKey] ? Object.keys(editedFields[modelKey]) : [];

      (['links', 'columns', 'custom']).forEach(typeKey => {
        if (modelStructure[typeKey]) {
          Object.entries(modelStructure[typeKey]).forEach(([fieldKey, fieldData]) => {
            if (
              !skipOldEditedFields.includes(fieldKey) && (
                selection[modelKey][fieldKey] === true ||
                (typeof selection[modelKey][fieldKey] === 'undefined' && addNewFields)
              )
            ) {
              newModel[typeKey][fieldKey] = fieldData
            }
          })
        }
      })

      // const newFields = Object.values(editedFields[modelKey] || []).concat(Object.values(newFields[modelKey]) || [])

      if (editedFields[modelKey]) {
        Object.values(editedFields[modelKey]).forEach(field => {
          if (field.type === 'custom') {
            newModel.custom[field.key] = field.meta
          }
          if (field.type === 'column') {
            newModel.columns[field.key] = field.meta
          }
          if (field.type === 'link') {
            newModel.links[field.key] = field.meta
          }
        })
      }

      if (newFields[modelKey]) {
        Object.values(newFields[modelKey]).forEach(field => {
          if (field.type === 'custom') {
            newModel.custom[field.key] = field.meta
          }
          if (field.type === 'column') {
            newModel.columns[field.key] = field.meta
          }
          if (field.type === 'link') {
            newModel.links[field.key] = field.meta
          }
        })
      }

      newStructure[modelKey] = newModel
    } else if (typeof selection[modelKey] === 'undefined' && addNewModels) {
      newStructure[modelKey] = modelStructure
    }
  })

  return newStructure
}

export class Structure implements Partial<ServiceMethods<IStructure>> {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async get (id: Id, params?: Params): Promise<IStructure> {
    const connectionsService = this.app.service('connections')
    const subsetsService = this.app.service('subsets')

    const { url, structurePath } = await connectionsService.get(id)

    const { subsetId, getInputStructure = false } = params.query || {}

    const baseStructure = await getStructure(structurePath, url)

    if (subsetId) {
      const subset = await subsetsService.get(subsetId)

      if (subset.connectionId !== id) {
        throw new Error(`Getting subset (${subsetId}) for the wrong connection (${id})!`)
      }

      if (subset.type === 'all_data') {
        if (getInputStructure) {
          return baseStructure
        } else {
          return applySubsetToStructure(baseStructure, subset)
        }
      } else {
        const allDataSubset = (await subsetsService.find({ query: { connectionId: id, type: 'all_data' } }))[0]
        if (!allDataSubset) {
          throw new Error(`Can not find "all_data" subset for connection "${id}"`)
        }

        const structureWithAllData = applySubsetToStructure(baseStructure, allDataSubset)

        if (getInputStructure) {
          return structureWithAllData
        } else {
          return applySubsetToStructure(structureWithAllData, subset)
        }
      }
    } else {
      const allDataSubset = (await subsetsService.find({ query: { connectionId: id, type: 'all_data' } }))[0]
      if (!allDataSubset) {
        throw new Error(`Can not find "All Data" subset for connection "${id}"`)
      }
      return applySubsetToStructure(baseStructure, allDataSubset)
    }
  }
}
