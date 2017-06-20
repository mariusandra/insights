import Logic, { initLogic } from 'kea/logic'
import { PropTypes } from 'react'

@initLogic
export default class StructureLogic extends Logic {
  path = () => ['scenes', 'structure', 'index']

  actions = ({ constants }) => ({
    openConnections: true,
    loading: true,
    connectionLoaded: connection => ({ connection }),
    structureLoaded: structure => ({ structure })
  })

  reducers = ({ actions, constants }) => ({
    loading: [false, PropTypes.bool, {
      [actions.loading]: () => true,
      [actions.structureLoaded]: () => false
    }],
    connection: [null, PropTypes.object, {
      [actions.loading]: () => null,
      [actions.connectionLoaded]: (_, payload) => payload.connection
    }],
    structure: [null, PropTypes.object, {
      [actions.loading]: () => null,
      [actions.structureLoaded]: (_, payload) => payload.structure
    }]
  })

  selectors = ({ constants, selectors }) => ({
    // todoCount: [
    //   () => [selectors.todos],
    //   (todos) => todos.length,
    //   PropTypes.number
    // ]
  })
}
