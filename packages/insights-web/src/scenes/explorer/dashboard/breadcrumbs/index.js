import React from 'react'
import { useActions, useValues } from 'kea'
import { Button, Col, Icon, Row } from 'antd'

import Database from '../../connection/database'
import Subset from '../../connection/subset'

import connectionLogic from '../../connection/logic'
import explorerLogic from 'scenes/explorer/logic'

function CustomStatistic({ title, className, value }) {
  return (
    <div className={`dashboard-statistic ${className}`}>
      <div className='statistic-title'>{title}</div>
      <div className='statistic-value'>{value}</div>
    </div>
  )
}

export default function BreadCrumbs () {
  const { selectedModel } = useValues(explorerLogic)
  const { selectedConnection, selectedSubset } = useValues(connectionLogic)

  const { focusSearch } = useActions(explorerLogic)

  return (
    <div className='dashboard-summary-row'>
      <Row gutter={20}>
        <Col xs={24} sm={24} md={12} lg={8} xl={8}>
          <CustomStatistic
            title='Connection'
            value={
              <Database>
                <Button type='link'>
                  {selectedConnection ? selectedConnection.name || <em>Untitled</em> : 'Not Selected'}
                  <Icon type="caret-down"/>
                </Button>
              </Database>
            }
          />
        </Col>
        <Col xs={24} sm={24} md={12} lg={8} xl={8}>
          <CustomStatistic
            title='Subset'
            className={`with-icon${!selectedSubset ? ' no-value' : ''}`}
            value={
              selectedConnection ? (
                <Subset>
                  <Button type='link'>
                    {selectedSubset ? selectedSubset.name || <em>Untitled</em> : 'Not Selected'}
                    <Icon type="caret-down"/>
                  </Button>
                </Subset>
              ) : (
                <div className='ant-button'>
                  No Connection
                </div>
              )
            }
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
          <CustomStatistic
            title='Model'
            className={`with-icon${!selectedModel ? ' no-value' : ''}`}
            value={selectedModel ? (
              <div onClick={focusSearch}>
                {selectedModel}
              </div>
            ) : 'Not Selected'}
          />
        </Col>
      </Row>
    </div>
  )
}
