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
    graphCumulative: false,
    percentages: false,
    alphabeticalFacets: false
  };

  (search || '').split('&').forEach(k => {
    const [key, value] = k.split('=').map(decodeURIComponent)

    if (key && value) {
      if (key === 'columns') {
        values[key] = value.split(',')
      } else if (key === 'graphCumulative' || key === 'percentages' || key === 'alphabeticalFacets') {
        values[key] = value === 'true'
      } else if (key === 'treeState') {
        value.split(',').filter(v => v).forEach(v => { values[key][v] = true })
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
