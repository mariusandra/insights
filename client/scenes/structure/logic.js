import Logic, { initLogic } from 'kea/logic'
import { PropTypes } from 'react'

@initLogic
export default class StructureLogic extends Logic {
  path = () => ['scenes', 'structure', 'index']

  actions = ({ constants }) => ({
    openConnections: true,
    startLoading: true,
    connectionLoaded: connection => ({ connection }),
    structureLoaded: structure => ({ structure })
  })

  reducers = ({ actions, constants }) => ({
    isLoading: [false, PropTypes.bool, {
      [actions.startLoading]: () => true,
      [actions.structureLoaded]: () => false
    }],
    connection: [null, PropTypes.object, {
      [actions.startLoading]: () => null,
      [actions.connectionLoaded]: (_, payload) => payload.connection
    }],
    structure: [null, PropTypes.object, {
      [actions.startLoading]: () => null,
      [actions.structureLoaded]: (_, payload) => payload.structure
    }]
  })

  selectors = ({ constants, selectors }) => ({
    models: [
      () => [selectors.structure],
      (structure) => structure ? Object.keys(structure).sort((a, b) => a.localeCompare(b)) : [],
      PropTypes.array
    ]
  })
}
