// @ts-ignore
import config from '../config'

export function inSetupMode (app) {
  return !app.get('authentication')?.secret || app.get('authentication').secret === config.authentication.secret
}
