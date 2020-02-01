import { kea } from 'kea'

import connectionLogic from '../../logic'
import explorerLogic from '../../../logic'

export default kea({
  connect: {
    actions: [
      connectionLogic, [
        'openSubset',
        'closeSubset'
      ]
    ],
    values: [
      explorerLogic, [
        'structure'
      ]
    ]
  }
})
