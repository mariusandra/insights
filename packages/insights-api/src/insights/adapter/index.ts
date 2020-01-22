import Postgres from './sql/postgres'
import SQLite from './sql/sqlite'

export default function createAdapter (connection: string, timeoutMs: number) {
  if (connection.indexOf('postgresql://') === 0 || connection.indexOf('psql://') === 0) {
    return new Postgres(connection, timeoutMs)
  } else if (connection.indexOf('sqlite://') === 0) {
    return new SQLite(connection, timeoutMs)
  } else {
    throw new Error('No compatible database found!')
  }
}
