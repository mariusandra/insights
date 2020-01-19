import io from 'socket.io-client'
import feathers from '@feathersjs/client'

const apiUrl = window.__INSIGHTS_CONFIG__ ? window.__INSIGHTS_CONFIG__.apiUrl : 'http://localhost:3030'
// const apiPath = window.__INSIGHTS_CONFIG__ ? window.__INSIGHTS_CONFIG__.apiPath : ''

const socket = io(apiUrl) //, { path: apiPath + '/socket.io' })
const client = feathers()

client.configure(feathers.socketio(socket))
client.configure(feathers.authentication({
  storage: window.localStorage
}))

export default client
