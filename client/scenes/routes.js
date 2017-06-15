import { combineScenesAndRoutes } from 'kea/scene'

const scenes = {
  connections: require('bundle?lazy&name=insights!./connections/scene.js'),
  dashboard: require('bundle?lazy&name=insights!./dashboard/scene.js'),
  explorer: require('bundle?lazy&name=insights!./explorer/scene.js'),
  login: require('bundle?lazy&name=insights!./login/scene.js')
}

const routes = {
  '/connections': 'connections',
  '/dashboard': 'dashboard',
  '/dashboard/:id': 'dashboard',
  '/explorer': 'explorer',
  '/': 'explorer',
  '/login': 'login'
}

export default combineScenesAndRoutes(scenes, routes)
