const { app, BrowserWindow, crashReporter } = require('electron')

const server = require('./app')

let mainWindow = null

// crashReporter.start({
//   productName: 'YourName',
//   companyName: 'YourCompany',
//   submitURL: 'https://your-domain.com/url-to-submit',
//   uploadToServer: true
// })
const httpServer = server.listen(0)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  let port = httpServer.address().port
  mainWindow.loadURL(`http://localhost:${port}`)

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
