import React from 'react'
import { useValues } from 'kea'
import { Card, Icon } from 'antd'

import explorerLogic from 'scenes/explorer/logic'
import connectionLogic from '../../connection/logic'

export default function Tutorial () {
  const {selectedModel} = useValues(explorerLogic)
  const {selectedConnection, selectedSubset} = useValues(connectionLogic)

  return (
    <Card bordered={false} title={<><Icon type='check-square' style={{color: 'white', marginRight: 5}} />Next steps</>}>
      <div className='next-steps'>
        {!selectedConnection || !selectedSubset ? (
          <div className='step-row'>
            <Icon type='database'/>
            <div className='info'>Select a <u>{!selectedConnection ? 'connection' : 'subset'}</u></div>
          </div>
        ) : null}
        {selectedConnection && selectedSubset && !selectedModel ? (
          <div className='step-row'>
            <Icon type='table'/>
            <div className='info'>
              Select a <u>model</u> from the sidebar on the left
              <br/>
              <img alt=''
                   src='https://user-images.githubusercontent.com/53387/74614004-29297500-5114-11ea-8682-6d4d02f57bed.png'
                   style={{width: 594 / 2}}/>
            </div>
          </div>
        ) : null}
        {selectedConnection && selectedSubset ? (
          <>
            <div className='step-row'>
              <Icon type='idcard'/>
              <div className='info'>
                Select <u>fields</u> on the model to explore data
                <br/>
                <img alt=''
                     src='https://user-images.githubusercontent.com/53387/74653066-bb1e9580-5187-11ea-8f7c-63ab9f989785.png'
                     style={{width: 588 / 2}}/>
                <img alt=''
                     src='https://user-images.githubusercontent.com/53387/74653219-03d64e80-5188-11ea-8ffc-8f01c5b45507.png'
                     style={{width: 778 / 2}}/>
              </div>
            </div>
            <div className='step-row'>
              <Icon type='area-chart'/>
              <div className='info'>
                Add "count" and a <u>time field</u> to get a timeline
                <br/>
                <img alt=''
                     src='https://user-images.githubusercontent.com/53387/74614565-1d8c7d00-5119-11ea-8793-07c270a34045.png'
                     style={{width: 1162 / 2}}/>
              </div>
            </div>
            <div className='step-row'>
              <Icon type='bars'/>
              <div className='info'>
                Add an <u>aggregation</u> to get summaries
                <br/>
                <img alt=''
                     src='https://user-images.githubusercontent.com/53387/74653833-4ba9a580-5189-11ea-95bf-a98d9a2a5fbf.png'
                     style={{width: 1050 / 2}}/>
              </div>
            </div>
            <div className='step-row'>
              <Icon type='filter'/>
              <div className='info'>
                Add <u>filters</u> to drill down on the data
                <br/>
                <img alt=''
                     src='https://user-images.githubusercontent.com/53387/74614203-33e50980-5116-11ea-912e-72dddc5c987a.png'
                     style={{width: 1158 / 2}}/>
              </div>
            </div>
            <div className='step-row'>
              <Icon type='star'/>
              <div className='info'>
                Save <u>views</u> to find later
                <br/>
                <img alt=''
                     src='https://user-images.githubusercontent.com/53387/74614336-5592c080-5117-11ea-8c1f-9dfc10474926.png'
                     style={{width: 610 / 2}}/>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </Card>
  )
}
