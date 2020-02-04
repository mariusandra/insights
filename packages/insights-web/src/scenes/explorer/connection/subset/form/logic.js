import { kea } from 'kea'

import modelsLogic from './models/logic'

export default kea({
  connect: {
    values: [
      modelsLogic, ['subsetSelection']
    ]
  },
  actions: () => ({
    saveSubset: (formValues) => ({ formValues })
  }),

  reducers: ({ actions }) => ({
    id: [null, {}]
  }),

  listeners: ({ actions, values }) => ({
    [actions.saveSubset]: async ({ formValues }) => {
      const { subsetSelection } = values
      console.log("SUBMITTING", { ...formValues, selection: subsetSelection })
    }
  })
})
