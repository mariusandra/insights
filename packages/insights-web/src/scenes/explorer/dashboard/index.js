import './styles.scss'

import React from 'react'
import { useValues } from 'kea'
import { Col, Row } from 'antd'

import explorerLogic from 'scenes/explorer/logic'
import connectionLogic from '../connection/logic'
import BreadCrumbs from './breadcrumbs'
import Views from './views'
import Tutorial from './tutorial'

export default function Dashboard () {
  const { selectedModel } = useValues(explorerLogic)
  const { selectedConnection, selectedSubset } = useValues(connectionLogic)

  return (
    <div className='explorer-dashboard'>
      <BreadCrumbs />

      {selectedConnection && selectedSubset && !selectedModel ? (
        <Row gutter={30}>
          <Col span={24}>
            <Views />
          </Col>
        </Row>
      ) : null}

      <Row gutter={30}>
        <Col span={24}>
          <Tutorial />
        </Col>
      </Row>
    </div>
  )
}
