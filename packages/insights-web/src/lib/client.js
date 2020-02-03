/* global window */
import io from 'socket.io-client'
import feathers from '@feathersjs/client'

const client = feathers()

// defaults
// eslint-disable-next-line
const { publicUrl, apiPath, socketPath } = window.__INSIGHTS_CONFIG__ || {
  publicUrl: 'http://localhost:3030',
  apiPath: '/',
  socketPath: '/socket.io'
}

// socket.io
const socket = io(publicUrl, { path: socketPath })
client.configure(feathers.socketio(socket, { timeout: 600000 }))

// REST api
// client.configure(feathers.rest(`${publicUrl}${apiPath === '/' ? '' : apiPath}`).fetch(window.fetch))

// authentication
client.configure(feathers.authentication({
  storage: window.localStorage
}))

export default client
