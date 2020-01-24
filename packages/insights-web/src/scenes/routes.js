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
  connections: require('./connections').default,
  structure: require('./structure').default,
  explorer: require('./explorer').default,
  login: require('./login').default
}

const routes = {
  '/connections': 'connections',
  '/connections/:id': 'structure',
  '/explorer': 'explorer',
  '/': 'explorer',
  '/login': 'login'
}

export default combineScenesAndRoutes(scenes, routes)
