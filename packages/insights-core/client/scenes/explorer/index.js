import './styles.scss'

// libraries
import React, { Component } from 'react'
import { connect } from 'kea'

// utils
import { Layout, LayoutSplitter } from 'react-flex-layout'
import { Button } from "@blueprintjs/core";

// components
import Graph from './graph'
import TimeFilter from './time-filter'
import Pagination from './pagination'
import Tree from './tree'
import Table from './table'
import Filter from './filter'
import AddToDashboard from './add-to-dashboard'

// logic
import explorerLogic from '~/scenes/explorer/logic'
import explorerSaga from '~/scenes/explorer/saga'

@connect({
  actions: [
    explorerLogic, [
      'refreshData'
    ]
  ],
  props: [
    explorerLogic, [
      'graph',
      'isSubmitting',
      'columns',
      'filter',
      'selectedModel'
    ]
  ],
  sagas: [
    explorerSaga
  ]
})
export default class Explorer extends Component {
  constructor (props) {
    super(props)

    this.state = {
      filterHeight: 40
    }
  }

  setFilterHeight = (filterHeight) => {
    if (this.state.filterHeight !== filterHeight) {
      this.setState({ filterHeight })
    }
  }

  render () {
    const { isSubmitting, columns, graph, selectedModel } = this.props
    const { filterHeight } = this.state
    const { refreshData } = this.props.actions

    const hasGraph = graph && graph.results

    return (
      <Layout className='explorer-scene' ref={ref => { this._layout = ref }}>
        <Layout layoutWidth={300} className='explorer-tree-bar'>
          <Tree />
        </Layout>
        <LayoutSplitter />
        <Layout layoutWidth='flex' ref={ref => { this._rightPane = ref }}>
          <Layout layoutHeight={50}>
            <div style={{padding: 10}}>
              <div className='top-controls'>
                {columns.length > 0 ? (
                  <Button icon='refresh' loading={isSubmitting} onClick={refreshData}>
                    Reload
                  </Button>
                ) : null}
                {hasGraph ? (
                  <AddToDashboard />
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
            {selectedModel ? <Filter setFilterHeight={this.setFilterHeight} /> : null}
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
      </Layout>
    )
  }
}
