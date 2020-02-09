import { kea } from 'kea'

import { message, Modal } from 'antd'

import client from 'lib/client'

import modelsLogic from './models/logic'
import connectionsLogic from '../../logic'
import explorerLogic from '../../../logic'

const subsetsService = client.service('subsets')

export default kea({
  connect: {
    values: [
      modelsLogic, ['subsetSelection', 'newFields', 'editedFields'],
      connectionsLogic, ['subset', 'connectionId']
    ],
    actions: [
      explorerLogic, ['refreshData'],
      connectionsLogic, ['setConnectionId', 'subsetEdited', 'subsetRemoved', 'closeSubset', 'loadStructure', 'loadSubsets']
    ]
  },

  actions: () => ({
    saveSubset: (formValues) => ({ formValues }),
    confirmRemoveSubset: subsetId => ({ subsetId }),
    removeSubset: subsetId => ({ subsetId })
  }),

  listeners: ({ actions, values }) => ({
    [actions.saveSubset]: async ({ formValues }) => {
      const { subsetSelection, newFields, editedFields, subset: { _id: subsetId }, connectionId } = values

      let subset

      if (subsetId) {
        subset = await subsetsService.patch(subsetId, { ...formValues, selection: subsetSelection, newFields, editedFields })
      } else {
        subset = await subsetsService.create({ ...formValues, type: 'custom', connectionId, selection: subsetSelection, newFields, editedFields })
      }

      actions.subsetEdited(subset)
      actions.closeSubset()
      actions.loadStructure(connectionId, subsetId)
      actions.refreshData()

      if (subsetId) {
        message.success(`Subset "${subset.name}" updated!`)
      } else {
        message.success(`Subset "${subset.name}" created!`)
        actions.setConnectionId(connectionId, subset._id)
      }
    },
    [actions.confirmRemoveSubset]: async ({ subsetId }) => {
      const { subset: { name } } = values

      Modal.confirm({
        title: `Delete the subset "${name}"?`,
        content: 'This can not be undone!',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk () {
          actions.removeSubset(subsetId)
        }
      })
    },
    [actions.removeSubset]: async ({ subsetId }) => {
      const { subset: { connectionId, name } } = values
      await subsetsService.remove(subsetId)
      actions.subsetRemoved(subsetId)
      actions.closeSubset()
      actions.setConnectionId(connectionId)
      actions.loadSubsets(connectionId)
      actions.refreshData()
      message.success(`Subset "${name}" removed!`)
    }
  })
})
