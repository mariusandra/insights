import { combineScenesAndRoutes } from 'kea/scene'

const scenes = {
  explorer: require('bundle?lazy&name=insights!./explorer/scene.js'),
  login: require('bundle?lazy&name=insights!./login/scene.js')
}

const routes = {
  '/explorer': 'explorer',
  '/login': 'login'
}

export default combineScenesAndRoutes(scenes, routes)
