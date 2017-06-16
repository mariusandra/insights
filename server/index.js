/* eslint-disable no-console */
const logger = require('winston')
const app = require('./app')

const port = process.env.INSIGHTS_PORT || app.get('port')

const server = app.listen(port)

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
)

server.on('listening', () =>
  logger.info(`Insights started on ${app.get('host')}:${port}`)
)
