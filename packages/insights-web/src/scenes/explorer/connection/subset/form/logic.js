import { kea } from 'kea'

import { message } from 'antd'

import client from 'lib/client'

import modelsLogic from './models/logic'
import connectionsLogic from '../../logic'
import explorerLogic from '../../../logic'

const subsetsService = client.service('subsets')

export default kea({
  connect: {
    values: [
      modelsLogic, ['subsetSelection'],
      connectionsLogic, ['subset', 'connectionId']
    ],
    actions: [
      connectionsLogic, ['subsetEdited', 'closeSubset', 'loadStructure'],
      explorerLogic, ['refreshData']
    ]
  },

  actions: () => ({
    saveSubset: (formValues) => ({ formValues })
  }),

  listeners: ({ actions, values }) => ({
    [actions.saveSubset]: async ({ formValues }) => {
      const { subsetSelection, subset: { _id: subsetId }, connectionId } = values

      let subset

      if (subsetId) {
        subset = await subsetsService.patch(subsetId, { ...formValues, selection: subsetSelection })
      } else {
        subset = await subsetsService.create({ ...formValues, type: 'custom', connectionId, selection: subsetSelection })
      }

      actions.subsetEdited(subset)
      actions.closeSubset()
      actions.loadStructure(connectionId, subsetId)
      actions.refreshData()
      message.success('Subset saved!')
    }
  })
})
