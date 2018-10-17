export function combineScenesAndRoutes (scenes, routes) {
  let combined = {}

  Object.keys(routes).forEach(route => {
    if (scenes[routes[route]]) {
      combined[route] = scenes[routes[route]]
    } else {
      console.error(`[KEA-LOGIC] scene ${routes[route]} not found in scenes object (route: ${route})`)
    }
  })

  return combined
}

const scenes = {
  connections: require('bundle-loader?lazy&name=insights!./connections/index.js'),
  structure: require('bundle-loader?lazy&name=insights!./structure/index.js'),
  dashboard: require('bundle-loader?lazy&name=insights!./dashboard/index.js'),
  explorer: require('bundle-loader?lazy&name=insights!./explorer/index.js'),
  login: require('bundle-loader?lazy&name=insights!./login/index.js')
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
