import './styles.scss'

import React from 'react'
import { useActions, useValues } from 'kea'
import { Select } from 'antd'

import explorerLogic from 'scenes/explorer/logic'

export default function TimeGroupSelect () {
  const { graphTimeGroup } = useValues(explorerLogic)
  const { setGraphTimeGroup, setGraphControls } = useActions(explorerLogic)

  function setGraphTimeGroupLocal (graphTimeGroup) {
    setGraphTimeGroup(graphTimeGroup)
    setGraphControls({ compareWith: 0 })
  }

  return (
    <Select size='small' value={graphTimeGroup} style={{ minWidth: 100 }} onChange={setGraphTimeGroupLocal}>
      <Select.Option value='day'>
        Daily
      </Select.Option>
      <Select.Option value='week'>
        Weekly
      </Select.Option>
      <Select.Option value='month'>
        Monthly
      </Select.Option>
      <Select.Option value='quarter'>
        Quarterly
      </Select.Option>
      <Select.Option value='year'>
        Yearly
      </Select.Option>
    </Select>
  )
}
