/* eslint-disable no-console */
const logger = require('winston')
const app = require('insights-api/lib/app').default

const port = process.env.INSIGHTS_API_PORT || app.get('port')
const host = app.get('host')

const server = app.listen(port)

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
)

server.on('listening', () =>
  logger.info(`Insights started on ${host}:${port}`)
)
