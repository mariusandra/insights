import { kea } from 'kea'

export default kea({
  actions: () => ({
    saveSubset: (formValues) => ({ formValues })
  }),

  reducers: ({ actions }) => ({
    id: [null, {}]
  }),

  listeners: ({ actions, values }) => ({
    [actions.saveSubset]: async ({ formValues }) => {
      console.log("SUBMITTING", formValues)
    }
  })
})
