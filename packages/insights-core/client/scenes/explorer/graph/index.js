// libraries
import { connect } from 'kea'

import { Graph } from 'insights-charts'

// utils
import Dimensions from 'react-dimensions'

// logic
import explorerLogic from '~/scenes/explorer/logic'

export const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']

export default connect({
  props: [
    explorerLogic, [
      'alphabeticalFacets',
      'percentages'
    ]
  ]
})(
  Dimensions({ elementResize: true })(Graph)
)
