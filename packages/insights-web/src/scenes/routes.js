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
  connections: require('./connections/index.js'),
  structure: require('./structure/index.js'),
  dashboard: require('./dashboard/index.js'),
  explorer: require('./explorer/index.js'),
  login: require('./login/index.js')
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
