// let url = {
//   connection: connection,
//   columns: columns.join(','),
//   sort: sort || '',
//   treeState: Object.keys(treeState).join(','),
//   graphTimeFilter: graphTimeFilter || '',
//   facetsColumn: facetsColumn || '',
//   facetsCount: facetsCount || '',
//   graphControls: {
//     ...
//   },
//   filter: [{ key: 'value' }]
// }

export default function (url) {
  const { filter, graphControls, treeState, columns, ...restOfUrl } = url

  let params = Object.assign({}, restOfUrl)

  if (filter) {
    filter.forEach(({ key, value }, i) => {
      params[`filter[${i}]`] = `${key}=${value}`
    })
  }

  if (graphControls) {
    params.graphControls = JSON.stringify(graphControls)
  }
  if (treeState) {
    params.treeState = Object.entries(treeState).map(([key, enabled]) => `${enabled ? '' : '!'}${key}`).join(',')
  }
  if (columns) {
    params.columns = columns.join(',')
  }

  const anythingSelected = Object.values(params).filter(v => v).length > 0

  const pathname = '/explorer'
  const search = anythingSelected ? '?' + Object.entries(params).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&') : ''

  return `${pathname}${search}`
}
