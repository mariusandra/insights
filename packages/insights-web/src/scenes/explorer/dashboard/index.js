import './styles.scss'

import React from 'react'
import { kea, useActions, useValues } from 'kea'
import { Button, Card, Col, Icon, Row } from 'antd'

import urlToState from 'lib/explorer/url-to-state'
import explorerLogic from 'scenes/explorer/logic'
import connectionLogic from '../connection/logic'
import viewsLogic from 'scenes/header/views/logic'
import PropTypes from 'prop-types'
import Database from '../connection/database'
import Subset from '../connection/subset'

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

function CustomStatistic({ title, className, value }) {
  return (
    <div className={`dashboard-statistic ${className}`}>
      <div className='statistic-title'>{title}</div>
      <div className='statistic-value'>{value}</div>
    </div>
  )
}

export default function Dashboard () {
  const { groupedViews } = useValues(logic)
  const { selectedModel } = useValues(explorerLogic)
  const { selectedConnection, selectedSubset } = useValues(connectionLogic)

  const { openView } = useActions(viewsLogic)
  const { focusSearch } = useActions(explorerLogic)

  return (
    <div className='explorer-dashboard'>
      <div className='dashboard-summary-row'>
        <Row gutter={20}>
          <Col xs={24} sm={24} md={12} lg={8} xl={8}>
            <CustomStatistic
              title='Connection'
              value={
                <Database>
                  <Button type='link'>
                    {selectedConnection ? selectedConnection.name || <em>Untitled</em> : 'Not Selected'}
                    <Icon type="caret-down" />
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
                      <Icon type="caret-down" />
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

      <Row gutter={30}>
        <Col span={24}>
          <Card bordered={false}>
            <div className='next-steps'>
              <h2>Next steps</h2>
              {!selectedConnection || !selectedSubset ? (
                <div className='step-row'>
                  <Icon type='database' />
                  <div className='info'>Please select a <u>{!selectedConnection ? 'connection' : 'subset'}</u></div>
                </div>
              ) : null}
              {selectedConnection && selectedSubset && !selectedModel ? (
                <div className='step-row'>
                  <Icon type='table' />
                  <div className='info'>
                    Select a <u>model</u> from the sidebar on the left
                    <br/>
                    <img alt='' src='https://user-images.githubusercontent.com/53387/74614004-29297500-5114-11ea-8682-6d4d02f57bed.png' style={{ width: 594 / 2 }} />
                  </div>
                </div>
              ) : null}
              {selectedConnection && selectedSubset ? (
                <>
                  <div className='step-row'>
                    <Icon type='idcard' />
                    <div className='info'>
                      Select <u>fields</u> on the model to explore data
                      <br />
                      <img alt='' src='https://user-images.githubusercontent.com/53387/74614085-1f544180-5115-11ea-9437-26594d156c4a.png' style={{ width: 588 / 2 }} />
                    </div>
                  </div>
                  <div className='step-row'>
                    <Icon type='bars' />
                    <div className='info'>
                      Add an <u>aggregation</u> (count, sum) to get summaries
                      <br />
                      <img alt='' src='https://user-images.githubusercontent.com/53387/74614481-81fb0c80-5118-11ea-88ea-b6abdcebd4ba.png' style={{ width: 922 / 2 }} />
                    </div>
                  </div>
                  <div className='step-row'>
                    <Icon type='area-chart' />
                    <div className='info'>
                      Add a <u>time field</u> to get a timeline
                      <br />
                      <img alt='' src='https://user-images.githubusercontent.com/53387/74614565-1d8c7d00-5119-11ea-8793-07c270a34045.png' style={{ width: 1162 / 2 }} />
                    </div>
                  </div>
                  <div className='step-row'>
                    <Icon type='filter' />
                    <div className='info'>
                      Add <u>filters</u> to drill down on the data
                      <br />
                      <img alt='' src='https://user-images.githubusercontent.com/53387/74614203-33e50980-5116-11ea-912e-72dddc5c987a.png' style={{ width: 1158 / 2 }} />
                    </div>
                  </div>
                  <div className='step-row'>
                    <Icon type='star' />
                    <div className='info'>
                      Save <u>views</u> to find later
                      <br />
                      <img alt='' src='https://user-images.githubusercontent.com/53387/74614336-5592c080-5117-11ea-8c1f-9dfc10474926.png' style={{ width: 610 / 2 }} />
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
