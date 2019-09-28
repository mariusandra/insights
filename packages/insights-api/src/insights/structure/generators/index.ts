import postgresGenerator from './postgres'

export default async function createAdapter (connection: string) {
  if (connection.indexOf('postgresql://') === 0 || connection.indexOf('psql://') === 0) {
    return postgresGenerator(connection)
  } else {
    throw new Error('No compatible database found!')
  }
}
