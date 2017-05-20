import { createScene } from 'kea/scene'

import sceneComponent from '~/scenes/header/index'

import sceneLogic from '~/scenes/header/logic'
import sceneSaga from '~/scenes/header/saga'

import viewsLogic from '~/scenes/header/views/logic'
import viewsSaga from '~/scenes/header/views/saga'

export default createScene({
  name: 'header',
  component: sceneComponent,
  logic: [
    sceneLogic,
    viewsLogic
  ],
  sagas: [
    sceneSaga,
    viewsSaga
  ]
})
