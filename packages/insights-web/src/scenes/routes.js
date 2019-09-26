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
  connections: require('./connections/index.js').default,
  structure: require('./structure/index.js').default,
  dashboard: require('./dashboard/index.js').default,
  explorer: require('./explorer/index.js').default,
  login: require('./login/index.js').default
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
