import { app, BrowserWindow, ipcMain } from 'electron'
import {win, macOS, linux, onWin, onLinux, onMacOS} from './platform'
import V2Ray from '../app'
import {createTray} from './tray'
const path = require('path')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

const home = process.env[win ? 'USERPROFILE' : 'HOME']

const workDir = process.env.NODE_ENV === 'development'
  ? path.resolve( __dirname + '/../../.app')
  : path.join(home, '.vpp')

const v2ray = new V2Ray(workDir)
const serverManager = new V2Ray.ServerManager(v2ray)

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 468,
    useContentSize: true,
    width: 768,
    resizable: false,
    maximizable: false
  })
  mainWindow.loadURL(winURL)
  mainWindow.on('closed', () => {
    mainWindow = null
    onMacOS(() => {
      app.dock.hide()
    })
  })
  createTray(app, mainWindow, v2ray)
  handleStartAndStop()
  handleAddServer()
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (!macOS) {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('show', function () {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }
    mainWindow.show()
  } else {
    createWindow()
  }
  onMacOS(() => {
    app.dock.show()
  })
})

function handleStartAndStop () {
  ipcMain.on('start', e => {
    v2ray.start()
  })
  ipcMain.on('stop', e => {
    v2ray.stop()
  })
}

function handleAddServer () {
  ipcMain.on('server.add', (e, data) => {

    serverManager.save(data)
  })
}



/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
