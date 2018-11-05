import { app, BrowserWindow, ipcMain } from 'electron'
const unzip = require('unzipper')
const fs = require('fs')
const request = require('request')
const progress = require('request-progress')
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
const home = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME']

const workDir = process.env.NODE_ENV === 'development'
  ? path.resolve( __dirname + '/../../.app')
  : path.join(home, '.vpp')

const coreDir = workDir + '/v2ray'

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
  downloadAndUnzip()
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

function downloadAndUnzip () {
  ipcMain.on('download', (e, url) => {
    let name = url.split('/').pop()
    let zip = `${workDir}/${name}`

    let extract = () => {
      return fs.createReadStream(zip).pipe(unzip.Extract({
        path: coreDir
      }))
    }
    if (!fs.existsSync(coreDir)){
      let file = fs.createWriteStream(zip)
      console.log('downloading')
      let stream = progress(request(url, {})).on('progress', state => {
        console.log(`download [${state.percent * 100}%]`)
      }).on('error', function (err) {
        console.log('download error !')
      }).on('end', function () {
        console.log('download complete')
      }).pipe(file)
      stream.on('finish', () => {
        extract().on('finish', () => {
          fs.unlink(zip, err => {
            console.log(err)
          })
        })
      })
    }

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