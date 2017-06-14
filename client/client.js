import feathers from 'feathers/client'
import socketio from 'feathers-socketio/client'
import hooks from 'feathers-hooks'
import io from 'socket.io-client'
import authentication from 'feathers-authentication-client'

// const socket = io('http://api.my-feathers-server.com')
const socket = io()
const app = feathers()
  .configure(hooks())
  .configure(socketio(socket))
  .configure(authentication({
    storage: window.localStorage
  }))

export default app
