import * as authentication from '@feathersjs/authentication';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

const addAllDataSubset = async context => {
  const { result: connection, app } = context

  const subsetsService = app.service('subsets')

  const subsetParams = {
    connectionId: connection._id,
    type: 'all_data',
    name: 'All Data',
    addNewModels: true,
    addNewFields: true,
    selection: {}
  }

  await subsetsService.create(subsetParams)

  return context;
}

const removeAllSubsets = async context => {
  const { app, result: connection } = context

  const subsetsService = app.service('subsets')
  await subsetsService.remove(null, { query: { connectionId: connection._id } })

  return context
}

const removeAllViews = async context => {
  const { app, result: connection } = context

  const viewsService = app.service('views')
  await viewsService.remove(null, { query: { connectionId: connection._id } })

  return context
}

export default {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [ addAllDataSubset ],
    update: [],
    patch: [],
    remove: [ removeAllSubsets, removeAllViews ]
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
