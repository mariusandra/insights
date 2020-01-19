import io from 'socket.io-client'
import feathers from '@feathersjs/client'

const client = feathers()

// websocket support
const socketUrl = window.__INSIGHTS_CONFIG__ ? window.__INSIGHTS_CONFIG__.socketUrl : 'http://localhost:3030'
const socket = io(socketUrl)
client.configure(feathers.socketio(socket))

// regular api fallback
// const apiUrl = window.__INSIGHTS_CONFIG__ ? window.__INSIGHTS_CONFIG__.apiUrl : 'http://localhost:3030'
// client.configure(feathers.rest(apiUrl).fetch(window.fetch))

// authentication
client.configure(feathers.authentication({
  storage: window.localStorage
}))

export default client
