export default function urlToState (path) {
  const [, search] = (path || '').split('?', 2)

  let values = {
    connection: null,
    columns: [],
    filter: [],
    treeState: {},
    graphTimeFilter: null,
    sort: null,
    facetsColumn: null,
    facetsCount: 6,
    graphControls: {
      type: 'area',
      sort: '123',
      cumulative: false,
      percentages: false,
      labels: false
    }
  };

  (search || '').split('&').forEach(k => {
    const [key, value] = k.split('=').map(decodeURIComponent)

    if (key && value) {
      if (key === 'columns') {
        values[key] = value.split(',')
      } else if (key === 'treeState') {
        value.split(',').filter(v => v).forEach(v => {
          if (v.indexOf('!') === 0) {
            values[key][v.substring(1)] = false
          } else {
            values[key][v] = true
          }
        })
      } else if (key === 'graphControls') {
        try {
          values.graphControls = JSON.parse(value)
        } catch (e) {
          // ignoring... ?
        }
      } else if (key === 'facetsCount') {
        values.facetsCount = parseInt(value)
      } else if (key === 'filter[]' || key.match(/^filter\[[0-9]+]$/)) {
        const [ k, v ] = value.split('=', 2)
        values.filter.push({ key: k, value: v })
      } else if (key.match(/^filter\[(.+)\]$/)) {
        const match = key.match(/^filter\[(.+)\]$/)
        values.filter.push({ key: match[1], value })
      } else {
        values[key] = value
      }
    }
  })

  return values
}
