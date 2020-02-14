import './styles.scss'

import React, { useState } from 'react'
import { useActions, useMountedLogic, useValues } from 'kea'

import { Layout, LayoutSplitter } from 'react-flex-layout'
import { Button } from "antd";

import Graph from './graph'
import TimeFilter from './time-filter'
import Pagination from './pagination'
import Sidebar from './sidebar'
import Table from './table'
import Filter from './filter'
import Welcome from './welcome'
import Help from './help'

import explorerLogic from 'scenes/explorer/logic'
import explorerSaga from 'scenes/explorer/saga'

export default function Explorer () {
  useMountedLogic(explorerSaga)

  const { isSubmitting, columns, graph, selectedModel } = useValues(explorerLogic)
  const { refreshData } = useActions(explorerLogic)

  const [filterHeight, setFilterHeight] = useState(40)

  const hasGraph = graph && graph.results

  return (
    <Layout className='explorer-scene'>
      <Layout layoutWidth={300} className='explorer-tree-bar'>
        <Sidebar />
      </Layout>
      <LayoutSplitter />
      {!selectedModel ? (
        <Layout layoutWidth='flex'>
          <Welcome />
        </Layout>
      ) : columns.length === 0 ? (
        <Layout layoutWidth='flex'>
          <Help />
        </Layout>
      ) : (
        <Layout layoutWidth='flex'>
          <Layout layoutHeight={50}>
            <div style={{padding: 10}}>
              <div className='top-controls'>
                {columns.length > 0 ? (
                  <Button icon='reload' loading={isSubmitting} onClick={refreshData}>
                    Reload
                  </Button>
                ) : null}
                {hasGraph ? (
                  <TimeFilter />
                ) : null}
              </div>
              <div className='top-pagination'>
                <Pagination />
              </div>
            </div>
          </Layout>
          <Layout layoutHeight={filterHeight}>
            {selectedModel ? <Filter filterHeight={filterHeight} setFilterHeight={setFilterHeight} /> : null}
          </Layout>
          {hasGraph ? (
            <Layout layoutHeight={300} className='visible-overflow'>
              <Graph />
            </Layout>
          ) : <div />}
          {hasGraph ? <LayoutSplitter /> : <div />}
          <Layout layoutHeight='flex'>
            <Table />
          </Layout>
        </Layout>
      )}
    </Layout>
  )
}
