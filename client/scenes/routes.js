import { combineScenesAndRoutes } from 'kea/scene'

const scenes = {
  connections: require('bundle-loader?lazy&name=insights!./connections/scene.js'),
  structure: require('bundle-loader?lazy&name=insights!./structure/scene.js'),
  dashboard: require('bundle-loader?lazy&name=insights!./dashboard/scene.js'),
  explorer: require('bundle-loader?lazy&name=insights!./explorer/scene.js'),
  login: require('bundle-loader?lazy&name=insights!./login/scene.js')
}

const routes = {
  '/connections': 'connections',
  '/connections/:id': 'structure',
  '/dashboard': 'dashboard',
  '/dashboard/:id': 'dashboard',
  '/explorer': 'explorer',
  '/': 'explorer',
  '/login': 'login'
}

export default combineScenesAndRoutes(scenes, routes)
