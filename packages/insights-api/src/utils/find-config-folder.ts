import fs from 'fs'
import path from 'path'

export function findConfigFolder (currentPath = process.cwd(), trials = [".insights", "config/insights"]) {
  while (true) {
    for (const trial of trials) {
      const fullPath = path.join(currentPath, trial)
      if (fs.existsSync(fullPath)) {
        return fullPath
      }
    }
    // split out
    let folders = currentPath.split(path.sep)
    folders.pop()

    if (folders.length === 0) {
      return
    }

    currentPath = folders.join(path.sep)
  }
}
