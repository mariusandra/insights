import { createScene } from 'kea/scene'

import sceneComponent from '~/scenes/dashboard/index'

import sceneLogic from '~/scenes/dashboard/logic'
import sceneSaga from '~/scenes/dashboard/saga'

export default createScene({
  name: 'dashboard',
  component: sceneComponent,
  logic: [
    sceneLogic
  ],
  sagas: [
    sceneSaga
  ]
})
