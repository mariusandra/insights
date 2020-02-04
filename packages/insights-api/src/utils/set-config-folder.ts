import {findConfigFolder} from './find-config-folder'

if (!process.env.NODE_CONFIG_DIR) {
  const configFolder = findConfigFolder()
  if (configFolder) {
    process.env.NODE_CONFIG_DIR = configFolder
  } else {
    console.error('Fatal Error! Could not find ".insights" config folder! Perhaps you still need to run "insights init"?')
    process.exit(1)
  }
}
