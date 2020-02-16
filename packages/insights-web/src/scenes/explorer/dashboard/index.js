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
      <Row gutter={30}>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="Connection"
              className={`with-icon${!selectedConnection ? ' no-value' : ''}`}
              value={selectedConnection ? selectedConnection.name || <em>Untitled</em> : 'None'}
              prefix={<Icon type="database" theme='filled' />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="Subset"
              className={`with-icon${!selectedSubset ? ' no-value' : ''}`}
              value={selectedSubset ? selectedSubset.name || <em>Untitled</em> : 'None'}
              prefix={<Icon type="bars" />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="Model"
              className={`with-icon${!selectedModel ? ' no-value' : ''}`}
              value={selectedModel || 'None'}
              prefix={<Icon type="table" />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={30}>
        <Col span={24}>
          <Card bordered={false}>
            <div className='next-steps'>
              <h2>Next steps</h2>
              {!selectedConnection || !selectedSubset ? (
                <p>
                  <Icon type='database' /> Please select a Connection
                </p>
              ) : (
                <>
                  <p>
                    <Icon type='table' /> Select a <u>model</u> from the sidebar on the left
                  </p>
                  <p>
                    <Icon type='idcard' /> Select <u>fields</u> on the model to explore data
                  </p>
                  <p>
                    <Icon type='area-chart' /> Add an <u>aggregation</u> (count, sum) on a field to visualise it
                  </p>
                </>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {selectedConnection && selectedSubset ? (
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
