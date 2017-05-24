import { combineScenesAndRoutes } from 'kea/scene'

const scenes = {
  dashboard: require('bundle?lazy&name=insights!./dashboard/scene.js'),
  explorer: require('bundle?lazy&name=insights!./explorer/scene.js'),
  login: require('bundle?lazy&name=insights!./login/scene.js')
}

const routes = {
  '/dashboard': 'dashboard',
  '/dashboard/:id': 'dashboard',
  '/explorer': 'explorer',
  '/login': 'login'
}

export default combineScenesAndRoutes(scenes, routes)
