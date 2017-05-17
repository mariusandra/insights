import { combineScenesAndRoutes } from 'kea/scene'

const scenes = {
  explorer: require('bundle?lazy&name=admin_with_secret_cheese!./explorer/scene.js')
}

const routes = {
  '/explorer': 'explorer'
}

export default combineScenesAndRoutes(scenes, routes)
