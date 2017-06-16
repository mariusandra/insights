export default function getMeta (column, structure) {
  const [ path ] = column.split('!')

  return path.split('.').reduce((lastStructure, key) => {
    if (lastStructure) {
      const { columns, custom, links } = lastStructure

      const meta = columns[key] || custom[key]
      if (meta) {
        return meta
      }

      const link = (links.incoming && links.outgoing) ? (links.incoming[key] || links.outgoing[key]) : links[key]
      if (link) {
        return structure[link.model]
      }
    } else if (structure[key]) {
      return structure[key]
    }

    return null
  }, null)
}
