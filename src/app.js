'use strict'

const unzip = require('unzipper')
const {spawn} = require('child_process')
const fs = require('fs')
const path = require('path')
const dayjs = require('dayjs')
const request = require('request')
const progress = require('request-progress')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const lodashId = require('lodash-id')
class V2Ray {

  constructor (workDir) {
    this.workDir = workDir
    this.coreDir = path.join(workDir, 'v2ray')
    const adapter = new FileSync(path.join(workDir, 'db.json'))
    this.db = low(adapter)
    this.db._.mixin(lodashId)
    this.db.defaults({
      servers: [],
      config: {
        autoConnect : true,
        currentServer : null,
        locale: 'zh_CN'
      }
    }).write()
  }

  static downloadUrl () {
    let type = 'macos'
    if (process.platform === 'win32') {
      type = 'windows-64'
    }

    if (process.platform === 'linux') {
      type = 'linux-64'
    }

    return `https://github.com/v2ray/v2ray-core/releases/download/v4.2/v2ray-${type}.zip`
  }

  static formatLine (line, type) {
    let time = dayjs().format('YYYY-MM-DD HH:mm:ss')
    return `[${time}][${type}] ${line}`
  }

  start (configPath, beforeStart, onProcess) {
    return this.install(beforeStart, onProcess).then(data => {
      configPath = configPath || path.join(this.coreDir, 'config.json')
      this.ps = spawn('v2ray', ['-config', configPath], {
        cwd: this.coreDir
      })
      this.ps.stdout.on('data', data => {
        this.log(data, 'system')
      })
    })
  }

  stop () {
    this.ps && this.ps.kill()
    this.log('V2Ray core stopped', 'system')
  }

  log (line, type) {
    let file = path.join(this.workDir, 'v2ray.log')
    fs.appendFile(file, V2Ray.formatLine(line, type), err => {
      err && console.log(`write log failed, file [${file}]`, err)
    })
  }

  install (onStart, onProcess) {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(this.coreDir)) {
        let url = V2Ray.downloadUrl()
        let name = url.split('/').pop()
        let zip = `${this.workDir}/${name}`

        let extract = () => {
          return fs.createReadStream(zip).pipe(unzip.Extract({
            path: this.coreDir
          }))
        }
        onStart && onStart()
        let file = fs.createWriteStream(zip)
        this.log('downloading v2ray core', 'system')
        let stream = progress(request(url, {})).on('progress', state => {
          onProcess && onProcess(state.percent)
        }).on('error', err => {
          this.log(`download error: ${err}`, 'system')
          reject()
        }).pipe(file)
        stream.on('finish', () => {
          extract().on('finish', () => {
            fs.unlink(zip, err => {
              this.log('unzip error: ${err}', 'system')
            })
            resolve()
          })
        })
      } else {
        onStart && onStart()
        onProcess && onProcess(100)
        resolve()
      }
    })
  }
}

class ServerManager {
  constructor(app) {
    this.app = app

  }

  save(server){
    let servers = this.app.db.get('servers')
    servers.insert(server).write()
    return server
  }

  remove(id) {
    this.app.db.get('servers').remove({id}).write()
  }
}

V2Ray.ServerManager = ServerManager

export default V2Ray