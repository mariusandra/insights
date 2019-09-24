import React from 'react'
import PropTypes from 'prop-types'

import mergeRanges from 'merge-ranges'
import {remove} from 'diacritics'

function allIndexesOf (str, word) {
  const indexes = []
  for (let idx = str.indexOf(word); idx !== -1; idx = str.indexOf(word, idx + 1)) {
    indexes.push(idx)
  }
  return indexes
}

function combine (text, ranges) {
  if (ranges.length === 0) {
    return text
  }
  let lastStart = 0
  let parts = []

  for (let i = 0; i < ranges.length; i++) {
    let [start, end] = ranges[i]
    if (lastStart !== start) {
      parts.push(<span key={lastStart}>{text.slice(lastStart, start)}</span>)
    }
    parts.push(<strong key={start}>{text.slice(start, end)}</strong>)

    if (i === ranges.length - 1 && end !== text.length) {
      parts.push(<span key={end}>{text.slice(end)}</span>)
    }
    lastStart = end
  }
  return parts
}

export default class HighlightText extends React.Component {
  static propTypes = {
    highlight: PropTypes.string.isRequired,
    children: PropTypes.string.isRequired
  };

  render () {
    if (!this.props.highlight) {
      return <span>{this.props.children}</span>
    }
    const normalizedText = remove(this.props.children).toLowerCase()
    const highlightIntervals = this.props.highlight
      .split(/(\s+)/)
      .map(word => word.trim())
      .filter(word => word)
      .reduce((intervals, word) => {
        const normalizedWord = remove(word).toLowerCase()
        const wordIntervals = allIndexesOf(normalizedText, normalizedWord)
          .map(idx => [idx, idx + normalizedWord.length])
        return intervals.concat(wordIntervals)
      }, [])

    return (
      <span>
        {combine(this.props.children, mergeRanges(highlightIntervals))}
      </span>
    )
  }
}
