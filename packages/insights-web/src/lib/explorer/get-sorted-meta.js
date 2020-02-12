export function getSortedMeta (column, sortedStructureObject) {
  if (Object.keys(sortedStructureObject).length === 0) {
    return null
  }

  const [ path ] = column.split('!')

  let field
  let lastModel
  let lastModelType

  path.split('.').forEach((pathPart, index) => {
    if (!lastModel) {
      if (sortedStructureObject[pathPart]) {
        lastModelType = pathPart
        lastModel = sortedStructureObject[lastModelType]
      } else {
        throw new Error(`Can not resolve "${pathPart}" in structure`)
      }
    } else {
      if (lastModel[pathPart]) {
        if (index === path.split('.').length - 1) {
          field = lastModel[pathPart]
        } else if (lastModel[pathPart].type === 'link') {
          lastModelType = lastModel[pathPart].meta.model
          lastModel = sortedStructureObject[lastModelType]
        } else {
          throw new Error(`Error, link "${pathPart}" in path "${path}" is not of type "link". ${JSON.stringify(lastModel[pathPart])}`)
        }
      } else {
        throw new Error(`Can not resolve link "${pathPart}" in path "${path}"`)
      }
    }
  })

  return field
}
