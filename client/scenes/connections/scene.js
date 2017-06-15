import { createScene } from 'kea/scene'

import sceneComponent from '~/scenes/connections/index'

import sceneLogic from '~/scenes/connections/logic'
import sceneSaga from '~/scenes/connections/saga'

export default createScene({
  name: 'connections',
  component: sceneComponent,
  logic: [
    sceneLogic
  ],
  sagas: [
    sceneSaga
  ]
})
