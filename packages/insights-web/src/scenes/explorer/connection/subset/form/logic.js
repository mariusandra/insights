import { kea } from 'kea'

import { message } from 'antd'

import client from 'lib/client'

import modelsLogic from './models/logic'
import connectionsLogic from '../../logic'

const subsetsService = client.service('subsets')

export default kea({
  connect: {
    values: [
      modelsLogic, ['subsetSelection'],
      connectionsLogic, ['subsetId']
    ],
    actions: [
      connectionsLogic, ['subsetEdited', 'closeSubset', 'loadStructure']
    ]
  },
  actions: () => ({
    saveSubset: (formValues) => ({ formValues })
  }),

  listeners: ({ actions, values }) => ({
    [actions.saveSubset]: async ({ formValues }) => {
      const { subsetSelection, subsetId } = values
      const subset = await subsetsService.patch(subsetId, { ...formValues, selection: subsetSelection })
      actions.subsetEdited(subset)
      actions.closeSubset()
      actions.loadStructure(subset.connectionId, subsetId)
      message.success('Subset saved!')
    }
  })
})
