/* eslint-disable no-console */
const path = require('path')
const fs = require('fs')
const URL = require('url')
const api = require('insights-api/lib/app').default
const express = require('express')
const bodyParser = require('body-parser')

const port = process.env.INSIGHTS_PORT
const host = process.env.INSIGHTS_HOST
const staticRoot = process.env.INSIGHTS_WEB_BUILD || path.join(__dirname, '..', '..', 'insights-web', 'build')
const socketUrl = process.env.INSIGHTS_SOCKET_URL || `http://${host}:${port}`
const apiUrl = process.env.INSIGHTS_API_URL || `http://${host}:${port}/api`
const apiPath = URL.parse(apiUrl).pathname

console.log({
  host,
  port,
  staticRoot,
  apiUrl,
  apiPath,
  socketUrl
})

let indexHtml

const getIndex = (req, res) => {
  if (!indexHtml) {
    const indexPath = path.join(staticRoot, 'index.html')
    const html = fs.readFileSync(indexPath, 'utf8')
    const insightsConfig = {
      apiPath,
      apiUrl,
      socketUrl
    }
    indexHtml = html.replace("</head>", `<script>window.__INSIGHTS_CONFIG__ = ${JSON.stringify(insightsConfig)}</script></head>`)
  }
  res.send(indexHtml)
}

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.get('/', getIndex)
app.get(apiPath, getIndex) // redirect /api -> /
app.use(apiPath, api)
app.use(express.static(staticRoot))
app.get('*', getIndex)

const server = app.listen(port, host)
api.setup(server)

process.on('unhandledRejection', (reason, p) =>
  console.error('Unhandled Rejection at: Promise ', p, reason)
)

server.on('listening', () =>
  console.info(`Insights started on ${host}:${port}`)
)
