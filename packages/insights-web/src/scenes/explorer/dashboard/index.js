import './styles.scss'

import React from 'react'
import { useValues } from 'kea'
import { Col, Row } from 'antd'

import explorerLogic from 'scenes/explorer/logic'
import connectionLogic from '../connection/logic'
import BreadCrumbs from './breadcrumbs'
import Views from './views'
import Tutorial from './tutorial'
import ModelMap from './model-map'

export default function Dashboard () {
  const { selectedModel } = useValues(explorerLogic)
  const { selectedConnection, selectedSubset } = useValues(connectionLogic)

  const showViews = selectedConnection && selectedSubset && !selectedModel

  return (
    <div className='explorer-dashboard'>
      <BreadCrumbs compact={selectedConnection && selectedSubset && selectedModel} />

      <Row gutter={20}>
        <Col xs={24} sm={24} md={24} lg={showViews ? 12 : 24} xl={showViews ? 12 : 24}>
          <Views />
        </Col>
        {showViews ? (
          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <ModelMap />
          </Col>
        ) : null}
      </Row>

      <Row gutter={20}>
        <Col span={24}>
          <Tutorial />
        </Col>
      </Row>
    </div>
  )
}
