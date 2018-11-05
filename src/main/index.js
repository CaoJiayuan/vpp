import { app, BrowserWindow, ipcMain } from 'electron'
const {unzip} = require('zlib')
const fs = require('fs')
const request = require('request')
const progress = require('request-progress')
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
  ipcMain.on('download', (e, url) => {
    let name = url.split('/').pop()
    let path = `${__dirname}/${name}`

    let file = fs.createWriteStream(path)
    console.log('downloading')
    progress(request(url, {})).on('progress', state => {
      console.log(`download [${state.percent * 100}%]`)
    }).on('error', function (err) {
      console.log('download error !')
    }).on('end', function () {
      console.log('download complete')
    }).pipe(file)
    //
    // http.get(url, {
    //   onDownloadProgress: function (progressEvent) {
    //     console.log(`download [${progressEvent.loaded}/${progressEvent.total}]`)
    //   },
    //   responseType: 'stream'
    // }).then(message => {
    //     message.data.pipe(file)
    //     console.log('done')
    //
    // })
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
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
