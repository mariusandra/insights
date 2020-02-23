import React from 'react'
import { Card, Tooltip, Icon } from 'antd'
import ReactWordcloud from 'react-wordcloud'

import explorerLogic from 'scenes/explorer/logic'
import { kea, useActions, useValues } from 'kea'

const logic = kea({
  connect: {
    values: [
      explorerLogic, ['sortedStructureObject']
    ]
  },
  selectors: ({ selectors }) => ({
    linkedModelCounts: [
      () => [selectors.sortedStructureObject],
      (sortedStructureObject) => {
        const counter = {}
        Object.entries(sortedStructureObject).forEach(([model, modelFields]) => {
          Object.values(modelFields).filter(f => f.type === 'link' && f.meta && f.meta.model).forEach(field => {
            const linkToModel = field.meta.model
            const linkToField = field.meta.model_key

            if (sortedStructureObject[linkToModel] && sortedStructureObject[linkToModel][linkToField]) {
              const otherField = sortedStructureObject[linkToModel][linkToField]
              if (otherField && otherField.meta && otherField.meta.index === 'primary_key') {
                counter[linkToModel] = (counter[linkToModel] || 0) + 1
              }
            }
          })
        })

        return counter
      }
    ],
    words: [
      () => [selectors.linkedModelCounts],
      (linkedModelCounts) => Object.entries(linkedModelCounts).map(([text, value]) => ({ text, value }))
    ]
  })
})

export default function ModelMap () {
  const { words } = useValues(logic)
  const { openModel } = useActions(explorerLogic)

  return (
    <Card bordered={false}>
      <h2>
        Most Linked Models
        <Tooltip title="Models with the most other models linking to them">
          <Icon type="question-circle" style={{ marginLeft: 10, fontSize: 14, verticalAlign: 'baseline', color: '#888' }} />
        </Tooltip>
      </h2>
      {words.length === 0 ? (
        <div>Your database has no foreign keys</div>
      ) : (
        <ReactWordcloud
          words={words}
          callbacks={{
            onWordClick: ({ text }) => openModel(text),
            getWordTooltip: ({ text, value }) => `${text} (${value} link${value === 1 ? '' : 's'})`
          }}
          options={{
            colors: [
              '#1f77b4',
              '#ff7f0e',
              '#2ca02c',
              '#d62728',
              '#9467bd',
              '#8c564b',
            ],
            enableTooltip: true,
            deterministic: true,
            rotations: 3,
            rotationAngles: [0],
            fontFamily: 'impact',
            fontSizes: [words.length < 20 ? 20 : 5, 60],
            fontStyle: 'normal',
            fontWeight: 'normal',
            scale: 'log',
            transitionDuration: 0
          }}
        />
      )}
    </Card>
  )
}
