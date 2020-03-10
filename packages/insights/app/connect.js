/* eslint-disable no-console */
const path = require('path')
const fs = require('fs')
const URL = require('url')
const api = require('insights-api/lib/app').default
const express = require('express')
const bodyParser = require('body-parser')
const localtunnel = require('localtunnel')
var NLTunnel = require('node-local-tunnel');

const startInsights = require('./start')

// const bridgeHost = 'http://bridge.insights.sh'
// const subdomain = undefined
const bridgeHost = 'bridge.insights.local'
const bridgePort = '4567'
const tunnelUrl = 'http://app-test.insights.local:4567'
// const subdomain = 'app-test'

module.exports = async function connectInsights () {
  const randomPort = 8001

  console.log(`Opening tunnel via ${bridgeHost}`)

  var options = {
    remoteHost: bridgeHost,
    port: bridgePort,
    localBase: `http://localhost:${randomPort}`
  }
  NLTunnel.client(options) // just call client() somewhere with options, you are free to go

  //
  // const tunnel = await localtunnel({
  //   port: randomPort,
  //   host: bridgeHost,
  //   subdomain: subdomain
  // })
  //
  // console.log('Tunnel opened: ', tunnelUrl)
  //
  // tunnel.on('close', () => {
  //   console.log('tunnel closed')
  //   // tunnels are closed
  // })

  const { app, server } = startInsights({
    host: '127.0.0.1',
    port: randomPort, // any free port

    publicUrl: tunnelUrl,
    staticRoot: path.join(__dirname, '..', 'web-build'),

    apiPath: `/api`,
    // TODO: no way to configure socketPath yet, must stay at "/socket.io"
    socketPath: '/socket.io',
    onListening: async () => {

      // the assigned public url for your tunnel
      // i.e. https://big-red-panda-42342.insights.sh
      // console.log(tunnelUrl)
      const http = require('http');

      // console.log("trying tunnel", tunnelUrl)
      http.get(tunnelUrl, (resp) => {
        console.log('Connection established!')
      })
    }
  })



}
