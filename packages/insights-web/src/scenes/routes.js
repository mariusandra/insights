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
  structure: require('./structure').default,
  explorer: require('./explorer').default,
  login: require('./login').default,
  users: require('./users').default,
  settings: require('./settings').default
}

const routes = {
  '/explorer': 'explorer',
  '/': 'explorer',
  '/login': 'login',
  '/users': 'users',
  '/settings': 'settings'
}

export default combineScenesAndRoutes(scenes, routes)
