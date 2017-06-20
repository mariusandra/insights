import React from 'react'

const columnTypes = ['number', 'string', 'boolean', 'time', 'date']
const otherMetaFields = ['index', 'url']

export default ({ column, columnMeta }) => (
  <tr>
    <td>
      <input type='checkbox' checked />
    </td>
    <td>{column}</td>
    <td>{columnMeta.type}</td>
    <td>
      {otherMetaFields.map(metaField => (
        <span key={metaField}>
          <label><input type='checkbox' checked={!!columnMeta[metaField]} /> {metaField}</label>
          {columnMeta[metaField] ? (metaField === 'url' ? (
            <input type='text' value={columnMeta[metaField]} />
          ) : metaField === 'index' ? (
            <input type='text' value={columnMeta[metaField]} />
          ) : null) : null}
        </span>
      ))}
    </td>
  </tr>
)
