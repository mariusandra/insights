import { createScene } from 'kea/scene'

import sceneComponent from '~/scenes/structure/index'

import sceneLogic from '~/scenes/structure/logic'
import sceneSaga from '~/scenes/structure/saga'

export default createScene({
  name: 'structure',
  component: sceneComponent,
  logic: [
    sceneLogic
  ],
  sagas: [
    sceneSaga
  ]
})
