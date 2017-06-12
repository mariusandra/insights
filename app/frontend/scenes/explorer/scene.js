import { createScene } from 'kea/scene'

import explorerComponent from '~/scenes/explorer/index'

import explorerLogic from '~/scenes/explorer/logic'
import explorerSaga from '~/scenes/explorer/saga'

export default createScene({
  name: 'explorer',
  component: explorerComponent,
  logic: [
    explorerLogic
  ],
  sagas: [
    explorerSaga
  ]
})
