import Saga from 'kea/saga'
import { put } from 'redux-saga/effects'
import { push } from 'react-router-redux'

import viewsLogic from '~/scenes/header/views/logic'

import messg from 'messg'

import controller from './controller.rb'

export default class SavedSaga extends Saga {
  actions = () => ([
    viewsLogic, [
      'saveView',
      'viewSaved',
      'viewsLoaded',
      'openView'
    ]
  ])

  takeEvery = ({ actions }) => ({
    [actions.saveView]: this.saveViewHelper,
    [actions.openView]: this.openViewHelper
  })

  run = function * (action) {
    const { viewsLoaded } = this.actions
    const result = yield controller.getViews({})

    if (result.success) {
      yield put(viewsLoaded(result.views))
    }
  }

  saveViewHelper = function * (action) {
    const { viewSaved } = this.actions
    const { newName } = yield viewsLogic.fetch('newName')

    if (newName.trim()) {
      const newPath = `${window.location.pathname}${window.location.search}`
      const result = yield controller.saveView({ name: newName, path: newPath })

      if (result.success) {
        yield put(viewSaved(result.view))
      }
    } else {
      messg.error('Please enter a name', 1000)
    }
  }

  openViewHelper = function * (action) {
    const { id } = action.payload
    const { views } = yield viewsLogic.fetch('views')
    const view = views[id]

    if (view) {
      yield put(push(view.path))
    }
  }
}
