/* eslint-disable no-console */
const logger = require('winston')
const path = require('path')
const api = require('insights-api/lib/app').default
const express = require('express')
const bodyParser = require('body-parser')

const port = process.env.INSIGHTS_PORT || api.get('port')
const host = process.env.INSIGHTS_HOST || api.get('host')
const apiPath = process.env.INSIGHTS_API_PATH || '/api'
const root = process.env.INSIGHTS_WEB_PUBLIC || path.join(__dirname, '..', '..', 'insights-web', 'build')

console.log(root)

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(apiPath, api);
app.use(express.static(root));
app.get('/*', (req, res) => {
  const index = path.join(root, 'index.html')
  res.sendFile(index);
})

const server = app.listen(port);
api.setup(server);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
)

server.on('listening', () =>
  logger.info(`Insights started on ${host}:${port}`)
)
