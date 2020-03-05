/* eslint-disable no-console */
const path = require('path')
const fs = require('fs')
const URL = require('url')
const api = require('insights-api/lib/app').default
const express = require('express')
const bodyParser = require('body-parser')

module.exports = function startInsights({
  host = process.env.INSIGHTS_HOST || '127.0.0.1',
  port = process.env.INSIGHTS_PORT || 8000,

  publicUrl = process.env.INSIGHTS_PUBLIC_URL || `http://${host}:${port}`,
  staticRoot = process.env.INSIGHTS_STATIC_ROOT || path.join(__dirname, '..', 'web-build'),

  apiPath = process.env.INSIGHTS_API_PATH || `/api`,
  // TODO: no way to configure socketPath yet, must stay at "/socket.io"
  socketPath = process.env.INSIGHTS_SOCKET_PATH || '/socket.io',
  onListening = undefined
} = {}) {
  console.log({
    host,
    port,
    publicUrl,
    staticRoot,
    socketPath,
    apiPath
  })

  let indexHtml

  const getIndex = (req, res) => {
    if (!indexHtml) {
      const html = fs.readFileSync(path.join(staticRoot, 'index.html'), 'utf8')
      const insightsConfig = {
        apiPath,
        socketPath,
        publicUrl,
        noLogin: api.get('authentication').authStrategies.includes('noLogin')
      }
      indexHtml = html.replace("</head>", `<script>window.__INSIGHTS_CONFIG__ = ${JSON.stringify(insightsConfig)}</script></head>`)
    }
    res.send(indexHtml)
  }

  const app = express()
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))
  app.get('/', getIndex)
  app.get(apiPath, getIndex) // redirect /api -> /
  app.use(apiPath, api)
  app.use(express.static(staticRoot))
  app.get('*', getIndex)

  console.info(`Starting insights on ${host} port ${port}`)

  const server = app.listen(port, host)
  api.setup(server)

  process.on('unhandledRejection', (reason, p) =>
    console.error('Unhandled Rejection at: Promise ', p, reason)
  )

  server.on('listening', () => {
    console.info(`--> ${publicUrl}`)
    onListening && onListening(app, server)
  })

  return app
}
