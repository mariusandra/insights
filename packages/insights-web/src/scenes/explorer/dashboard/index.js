import './styles.scss'

import React from 'react'
import { kea, useActions, useValues } from 'kea'
import { Card, Col, Icon, Row, Statistic } from 'antd'

import urlToState from 'lib/explorer/url-to-state'
import explorerLogic from 'scenes/explorer/logic'
import connectionLogic from '../connection/logic'
import viewsLogic from 'scenes/header/views/logic'
import PropTypes from 'prop-types'

const logic = kea({
  connect: {
    values: [explorerLogic, ['subsetViews']]
  },

  selectors: ({ selectors }) => ({
    groupedViews: [
      () => [selectors.subsetViews],
      (subsetViews) => {
        let groups = {}
        subsetViews.forEach(view => {
          let model = ''
          const viewState = urlToState(view.path)
          if (viewState.columns && viewState.columns[0]) {
            model = viewState.columns[0].split('.')[0]
          }
          if (model) {
            if (!groups[model]) {
              groups[model] = []
            }
            groups[model].push(view)
          }
        })

        let groupKeys = Object.keys(groups).sort((a, b) => a.localeCompare(b))

        return groupKeys.map(key => ({ group: key, views: groups[key] }))
      },
      PropTypes.array
    ]
  })
})

export default function Dashboard () {
  const { groupedViews } = useValues(logic)
  const { selectedModel } = useValues(explorerLogic)
  const { selectedConnection, selectedSubset } = useValues(connectionLogic)

  const { openView } = useActions(viewsLogic)

  return (
    <div className='explorer-dashboard'>
      <div className='dashboard-summary-row'>
        <Row gutter={20}>
          <Col xs={24} sm={24} md={12} lg={8} xl={8}>
            <Statistic
              title='Connection'
              className={`with-icon${!selectedConnection ? ' no-value' : ''}`}
              value={selectedConnection ? selectedConnection.name || <em>Untitled</em> : 'Not Selected'}
            />
          </Col>
          <Col xs={24} sm={24} md={12} lg={8} xl={8}>
            <Statistic
              title='Subset'
              className={`with-icon${!selectedSubset ? ' no-value' : ''}`}
              value={selectedSubset ? selectedSubset.name || <em>Untitled</em> : 'Not Selected'}
            />
          </Col>
          <Col xs={24} sm={24} md={24} lg={8} xl={8}>
            <Statistic
              title='Model'
              className={`with-icon${!selectedModel ? ' no-value' : ''}`}
              value={selectedModel || 'Not Selected'}
            />
          </Col>
        </Row>
      </div>

      <Row gutter={30}>
        <Col span={24}>
          <Card bordered={false}>
            <div className='next-steps'>
              <h2>Next steps</h2>
              {!selectedConnection || !selectedSubset ? (
                <div className='step-row'>
                  <Icon type='database' />
                  <span className='info'>Please select a <u>{!selectedConnection ? 'connection' : 'subset'}</u></span>
                </div>
              ) : null}
              {selectedConnection && selectedSubset && !selectedModel ? (
                <div className='step-row'>
                  <Icon type='table' />
                  <span className='info'>Select a <u>model</u> from the sidebar on the left</span>
                </div>
              ) : null}
              {selectedConnection && selectedSubset ? (
                <>
                  <div className='step-row'>
                    <Icon type='idcard' />
                    <span className='info'>Select <u>fields</u> on the model to explore data</span>
                  </div>
                  <div className='step-row'>
                    <Icon type='area-chart' />
                    <span className='info'>Add an <u>aggregation</u> (count, sum) on a field to visualise it</span>
                  </div>
                </>
              ) : null}
              {selectedConnection && selectedSubset && selectedModel ? (
                <>
                  <div className='step-row'>
                    <Icon type='filter' />
                    <span className='info'>Add <u>filters</u> to drill down on the data</span>
                  </div>
                  <div className='step-row'>
                    <Icon type='star' />
                    <span className='info'>Save <u>views</u> to find later</span>
                  </div>
                </>
              ) : null}
            </div>
          </Card>
        </Col>
      </Row>

      {selectedConnection && selectedSubset && !selectedModel ? (
        <Row gutter={30}>
          <Col span={24}>
            <Card bordered={false}>
              <h2>
                Saved views
                <Icon type='star' theme={groupedViews.length > 0 ? "filled" : ''} style={{ color: 'hsl(42, 98%, 45%)', marginLeft: 5 }} />
              </h2>
              {groupedViews.length === 0 ? (
                <p>
                  Saved views will show up here
                </p>
              ) : (
                <div>
                  {groupedViews.map(({ group, views }) => (
                    <div key={group}>
                      <strong>{group}</strong>
                      <ol>
                        {views.map(view => (
                          <li key={view._id}>
                            <u style={{ cursor: 'pointer' }} onClick={() => openView(view._id)}>{view.name}</u>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>
        </Row>
      ) : null}
    </div>
  )
}
