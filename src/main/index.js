import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import {win, macOS, linux, onWin, onLinux, onMacOS} from './platform'
import V2Ray from '../app'
import {createTray} from './tray'
import { lang } from '../lang/index'
const path = require('path')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}
const hideAtStart = false

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

const home = process.env[win ? 'USERPROFILE' : 'HOME']

const workDir = process.env.NODE_ENV === 'development'
  ? path.resolve( __dirname + '/../../.app')
  : path.join(home, '.vpp')

const v2ray = new V2Ray(workDir)
v2ray.init()
function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 680,
    useContentSize: true,
    width: 986,
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

  let template = [
    {
      label: 'Vpp',
      submenu: [
        { label: 'Vpp', enabled: false },
        { label: lang("Preferences"), accelerator: "CmdOrCtrl+,", selector: "undo:", click: () => {
          app.emit('show')
          send('navigate', '/config')
        }},
        { type: "separator" },
        { label: lang("Quit"), accelerator: macOS ? "Cmd+Q" : "Ctrl+F4", role: "quit" },
      ]
    },
    {
      label: lang("Edit"),
      submenu: [
        { label: lang("Undo"), accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: lang("Redo"), accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: lang("Cut"), accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: lang("Copy"), accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: lang("Paste"), accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: lang("Select All"), accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.on('ready', () => {
  if (!mainWindow && !hideAtStart) {
    createWindow()
    app.emit('show')
  }
  createTray(v2ray)
  handleStartAndStop()
  handleAddServer()
  hideAtStart && hide()
  v2ray.handleIpc()
  if (v2ray.setting('autoConnect') && v2ray.installed) {
    v2ray.start()
  }
})

app.on('window-all-closed', () => {
  if (!macOS) {
    app.quit()
  }
})

app.on('activate', () => {

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

     v2ray.serverManager.save(data)
  })
}

function hide () {
  if (mainWindow) {
    mainWindow.hide()
  }
  onMacOS(() => {
    app.dock.hide()
  })
}

app.on('will-quit', () => {
  v2ray.stop()
})
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
export function send(channel, data){
  if(mainWindow) {
    mainWindow.webContents.send(channel, data)
  }
}
