import Saga from 'kea/saga'
import { put, call } from 'redux-saga/effects'
import { push } from 'react-router-redux'

import { waitUntilLogin } from '~/scenes/auth'
import viewsLogic from '~/scenes/header/views/logic'

import messg from 'messg'

import client from '~/client'

// import controller from './controller.rb'
const viewsService = client.service('api/views')

export default class ViewsSaga extends Saga {
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
    yield call(waitUntilLogin)

    try {
      yield call(this.loadViews)
    } catch (error) {
      console.error('Could not load views', error)
    }
  }

  loadViews = function * (action) {
    const { viewsLoaded } = this.actions
    const results = yield viewsService.find({})

    if (results.total > 0) {
      yield put(viewsLoaded(results.data))
    }
  }

  saveViewHelper = function * (action) {
    const { viewSaved } = this.actions
    const { newName } = yield viewsLogic.fetch('newName')

    if (newName.trim()) {
      const newPath = `${window.location.pathname}${window.location.search}`
      const result = yield viewsService.create({ name: newName, path: newPath })

      if (result) {
        yield put(viewSaved(result))
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
