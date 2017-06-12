import Logic, { initLogic } from 'kea/logic'
import { PropTypes } from 'react'

@initLogic
export default class HeaderLogic extends Logic {
  path = () => ['scenes', 'header', 'index']

  constants = () => [
  ]

  actions = ({ constants }) => ({
    openLocation: (location) => ({ location })
  })

  reducers = ({ actions, constants }) => ({
  })

  selectors = ({ constants, selectors }) => ({
  })
}
