import { createScene } from 'kea/scene'

import sceneComponent from '~/scenes/login/index'

import sceneLogic from '~/scenes/login/logic'
import sceneSaga from '~/scenes/login/saga'

export default createScene({
  name: 'login',
  component: sceneComponent,
  logic: [
    sceneLogic
  ],
  sagas: [
    sceneSaga
  ]
})
