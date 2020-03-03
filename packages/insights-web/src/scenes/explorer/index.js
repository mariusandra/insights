import './styles.scss'

import React, { useState } from 'react'
import { useActions, useMountedLogic, useValues } from 'kea'

import { Layout, LayoutSplitter } from 'react-flex-layout'
import { Button, Card, Col, Icon, Row, Tooltip } from "antd"

import Graph from './graph'
import TimeGroupSelect from './graph/time-group-select'
import TimeFilter from './time-filter'
import Pagination from './pagination'
import Sidebar from './sidebar'
import Table from './table'
import Filter from './filter'
import Dashboard from './dashboard'

import explorerLogic from 'scenes/explorer/logic'
import explorerSaga from 'scenes/explorer/saga'
import layoutLogic from '../_layout/logic'
import BreadCrumbs from './dashboard/breadcrumbs'
import { openDashboards } from '../header'

function Reload () {
  const { isSubmitting } = useValues(explorerLogic)
  const { refreshData } = useActions(explorerLogic)

  return (
    <Tooltip title='Reload'>
      <Button icon='sync' size='small' loading={isSubmitting} onClick={refreshData} />
    </Tooltip>
  )
}

function AddToDashboard () {
  return (
    <Tooltip title='Add To Dashboard'>
      <Button icon='fund' size='small' onClick={openDashboards} />
    </Tooltip>
  )
}

function FullScreen () {
  return (
    <Tooltip title='Toggle FullScreen'>
      <Button icon='fullscreen' size='small' />
    </Tooltip>
  )
}

function CardControls () {
  return (
    <>
      <AddToDashboard />
      {' '}
      <FullScreen />
      {' '}
      <Reload />
    </>
  )
}

export default function Explorer () {
  useMountedLogic(explorerSaga)

  const { columns, hasGraph, selectedModel, count, filter } = useValues(explorerLogic)
  const { menuOpen } = useValues(layoutLogic)

  const [tableExpanded, setTableExpanded] = useState(false)

  return (
    <Layout className={`explorer-scene with-dashboard`}>
      <Layout layoutWidth={menuOpen ? 300 : 1} className='explorer-tree-bar'>
        {menuOpen ? <Sidebar /> : null}
      </Layout>
      <LayoutSplitter />
      {!selectedModel || columns.length === 0 ? (
        <Layout layoutWidth='flex' className='explorer-dashboard-layout'>
          <Dashboard />
        </Layout>
      ) : (
        <Layout layoutWidth='flex' className='explorer-dashboard-layout'>
          <div className='explorer-dashboard'>
            <BreadCrumbs compact />

            {filter.length > 0 ? (
              <Row gutter={20}>
                <Col span={24}>
                  <Card bordered={false} title='Filters'>
                    <div style={{ marginTop: -5, marginBottom: -5 }}>
                      <Filter />
                    </div>
                  </Card>
                </Col>
              </Row>
            ) : null}

            <Row gutter={20}>
              <Col span={24}>
                <Card bordered={false} title={
                  <>
                    {hasGraph ? (
                      <div style={{ float: 'right' }}>
                        <TimeFilter />
                        {' '}
                        <TimeGroupSelect style={{ display: 'inline-block' }} />
                        {' '}
                        <CardControls />
                      </div>
                    ) : null}
                    <Icon type='line-chart' style={{color: 'white', marginRight: 5}}/>
                    Graph
                  </>
                }>
                  {hasGraph ? (
                    <div style={{ height: 300 }} className='visible-overflow'>
                      <Graph />
                    </div>
                  ) : (
                    <div style={{ color: '#aaa' }}>
                      Add a date field to see a graph
                    </div>
                  )}
                </Card>
              </Col>
            </Row>

            <Row gutter={20}>
              <Col span={24}>
                <Card bordered={false} title={
                  <>
                    <div style={{ float: 'right' }}>
                      {hasGraph && count >= 10 ? (
                        <Button size='small' onClick={() => setTableExpanded(!tableExpanded)} icon={tableExpanded ? 'up' : 'down'} style={{ marginRight: 3 }}>
                          {tableExpanded ? 'Collapse' : 'Expand'}
                        </Button>
                      ) : null}
                      <CardControls />
                    </div>
                    {count > 0 ? <>
                      <Icon type='ordered-list' style={{color: 'white', marginRight: 5}}/>
                      Results: <Pagination />
                    </> : <><Icon type='ordered-list' style={{color: 'white', marginRight: 5}}/>Results</>}
                  </>
                } bodyStyle={{ padding: 0 }}>
                  {count > 0 ? (
                    <>
                      <Table tableHeight={(tableExpanded || !hasGraph) ? 600 : 329} />
                    </>
                  ) : (
                    <div style={{ color: '#aaa', padding: 16 }}>
                      No results found
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </div>
        </Layout>
      )}
    </Layout>
  )
}
