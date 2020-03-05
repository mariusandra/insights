const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const fs = require('fs')
const path = require('path')
const getPort = require('get-port')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

const configFolder = path.join((app || electron.remote.app).getPath('userData'), 'Insights Config');

function createWindow (url) {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1200, height: 800})

  // and load the index.html of the app.
  mainWindow.loadURL(url)

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

function startElectron (url) {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.

  // Quit when all windows are closed.
  app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow(url)
    }
  })

  app.on('ready', () => createWindow(url))
}

function startInsightsAndElectron () {
  const startInsights = require('insights/app/start')

  startInsights({
    host: process.env.INSIGHTS_HOST,
    port: process.env.INSIGHTS_PORT,
    onListening: (app, server) => {
      startElectron(process.env.INSIGHTS_PUBLIC_URL)
    }
  })
}

async function startInsightsDesktop () {
  console.log(`Config in ${configFolder}`)
  process.env.NODE_ENV = 'production'
  process.env.NODE_CONFIG_DIR = configFolder;

  if (!fs.existsSync(configFolder)) {
    const initInsights = require('insights/app/init')
    await initInsights({ dev: false, login: false, configFolder, exitWhenDone: false })
  }

  process.env.INSIGHTS_HOST = '127.0.0.1'
  process.env.INSIGHTS_PORT = await getPort()
  process.env.INSIGHTS_PUBLIC_URL = `http://${process.env.INSIGHTS_HOST}:${process.env.INSIGHTS_PORT}`

  startInsightsAndElectron()
}

module.exports = startInsightsDesktop
