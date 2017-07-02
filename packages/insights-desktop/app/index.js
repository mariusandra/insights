const { app, BrowserWindow } = require('electron')

const server = require('insights-core/app')

const authenticationElectron = require('./authentication-electron')
server.configure(authenticationElectron)

let mainWindow = null

const httpServer = server.listen(0)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  let url = '/'

  const connections = await server.service('api/connections').find({})
  if (connections.total === 0) {
    url = '/connections'
  }

  let port = httpServer.address().port
  mainWindow.loadURL(`http://localhost:${port}${url}?electron-connect-api-key=${server.get('electronConnectApiKey')}`)

  if (process.env.NODE_ENV !== 'production') {
    mainWindow.openDevTools()
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('ready', createWindow)
