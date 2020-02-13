import React, { Component } from 'react'
import { connect } from 'kea'

import { Popover, Icon } from 'antd'

import explorerLogic from 'scenes/explorer/logic'

const logic = connect({
  actions: [
    explorerLogic, [
      'clearColumnWidths',
      'setFacetsCount',
      'requestExport',
      'setExportTitle'
    ]
  ],
  props: [
    explorerLogic, [
      'columnWidths',
      'facetsCount',
      'exportTitle'
    ]
  ]
})

class TableSettings extends Component {
  constructor (props) {
    super(props)

    this.state = {
      tooltipHover: false
    }
  }

  handleTooltip = (tooltipHover) => {
    this.setState({ tooltipHover })
  }

  render () {
    const { columnWidths, exportTitle } = this.props
    const { clearColumnWidths, requestExport, setExportTitle } = this.props.actions
    const { tooltipHover } = this.state

    const overlay = (
      <div className='column-settings'>
        {Object.keys(columnWidths).length > 0 ? (
          <span onClick={clearColumnWidths} style={{textDecoration: 'underline', cursor: 'pointer'}}>
            Auto-resize columns
          </span>
        ) : (
          <span>
            Auto-resize columns: <u>enabled</u>
          </span>
        )}

        <br />
        <div>
          Export:
          <br />
          <input value={exportTitle} onChange={e => setExportTitle(e.target.value)} style={{ width: '100%' }} placeholder='Export title...' />
          <br />
          Format:
          {' '}
          <span style={{textDecoration: 'underline', cursor: 'pointer'}} onClick={() => requestExport('xlsx')}>xlsx</span>
          {' - '}
          <span style={{textDecoration: 'underline', cursor: 'pointer'}} onClick={() => requestExport('pdf')}>pdf</span>
        </div>
      </div>
    )

    let className = 'cell-header'

    if (tooltipHover) {
      className = `${className} hover`
    }

    return (
      <Popover placement='bottomLeft' trigger={'hover'} content={overlay} onVisibleChange={this.handleTooltip}>
        <div className={className}
          onClick={this.handleSort}>
          <Icon type='menu' />
        </div>
      </Popover>
    )
  }
}

export default logic(TableSettings)
