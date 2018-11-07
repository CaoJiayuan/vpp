'use strict'
import {lang} from './lang'
import {tray} from './main/tray'
import {ping} from './main/tester'
import {win} from './main/platform'
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
    this.configPath = path.join(this.workDir, 'config.json')
    this.pidFile = path.join(workDir, 'v2ray.pid')
    this.started = fs.existsSync(this.pidFile)
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

  checkCoreUpdate () {
    this.version().then(v => {
      request('https://api.github.com/repos/v2ray/v2ray-core/releases/latest', (err, resp, body) => {

      })
    })
  }

  init (dbPath) {
    dbPath = dbPath || path.join(this.workDir, 'db.json')
    const adapter = new FileSync(dbPath)
    this.db = low(adapter)
    this.db._.mixin(lodashId)
    this.db.defaults({
      servers: [],
      users: [],
      groups: [],
      config: {
        autoConnect: false,
        currentServer: null,
        locale: 'zh_CN'
      }
    }).write()
    this.serverManager = new ServerManager(this)
    const configDBAdapter = new FileSync(this.configPath)
    this.configDB = low(configDBAdapter)
    this.configDB.defaults({
      "log": {
        "loglevel": "warning"
      },
      "inbound": {
        "port": 3080,
        "listen": "127.0.0.1",
        "protocol": "socks",
        "settings": {
          "auth": "noauth",
          "udp": false,
          "ip": "127.0.0.1"
        }
      },
      "outbound": {
        "protocol": "vmess",
        "settings": {},
        "tag": "direct"
      }
    }).write()
  }

  start () {
    return new Promise((resolve, reject) => {
      this.ps = spawn('./v2ray', ['-config', this.configPath], {
        cwd: this.coreDir
      })
      this.ps.stdout.on('data', data => {
        if (data.toString().indexOf('started') > -1) {
          this.log(data, 'system')
          this.started = true
          tray.emit('should-update')
          resolve()
          fs.writeFile(this.pidFile, this.ps.pid, err => {})
        }
      })
      this.ps.on('exit', (code, signal) => {
        this.log('V2Ray core stopped\n', 'system')
        this.started = false
        tray.emit('should-update')
      })
    })
  }

  setting(key, value){
    if (key === undefined) {
      return this.db.get('config')
    }
    if (value === undefined) {
      return this.db.get('config').value()[key]
    }

    let config = this.db.get('config')

    config.set(key, value).write()
    return config
  }

  stop () {
    return new Promise(resolve => {
      fs.unlink(this.pidFile, err => err && console.log(err))

      if (this.ps) {
        this.ps.on('exit', (code, signal) => {
          this.started = false
          tray.emit('should-update')
          resolve(code)
        })
        this.ps.kill()
      } else  {
        this.started = false
        tray.emit('should-update')
        resolve()
      }
    })
  }

  restart(){
    return this.stop().then(c => {
      this.start()
    })
  }

  log (line, type) {
    let file = path.join(this.workDir, 'v2ray.log')
    fs.appendFile(file, V2Ray.formatLine(line, type), err => {
      err && console.log(`write log failed, file [${file}]`, err)
    })
  }

  version(beforeStart, onProcess){
    return this.install(beforeStart, onProcess).then(data => {
      return new Promise(resolve => {
        let version = spawn('./v2ray', ['-version'], {
          cwd: this.coreDir
        })
        version.stdout.on('data', data => {
          resolve(data.toString().split('(', 2)[0])
        })
      })
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
            if (!win) {
              spawn('chmod', ['+x', 'v2ray'], {
                cwd: this.coreDir
              })
            }
            resolve()
          })
        })
      } else {
        resolve()
      }
    })
  }
}

class ServerManager {
  constructor (app) {
    this.app = app
  }

  save (server) {
    let servers = this.app.db.get('servers')
    servers.insert(server).write()
    return server
  }

  remove (id) {
    this.app.db.get('servers').remove({id}).write()
  }

  update(where, data){
    this.app.db.get('servers')
      .find(where)
      .assign(data)
      .write()
  }

  servers () {
    return this.app.db.get('servers').value()
  }

  groups(){
    let gs = this.app.db.get('groups').value().map(g => {
      g.servers = this.app.db.get('servers').filter(s => s.group_id === g.id).value()
      return g
    })

    gs.unshift({
      id: 'default',
      name: lang('default_group'),
      servers: this.app.db.get('servers').filter(s => !s.group_id).value()
    })

    return gs;
  }

  select(srv){
    let outbound = this.app.configDB.get('outbound')

    outbound.set('settings.vnext', [
      srv
    ]).write()
    this.app.setting('currentServer', srv.id)
    this.app.restart()
  }

  test(){
    this.servers().forEach(srv => {
      ping(srv.address).then(ms => {
        this.update({id: srv.id}, {
          delay : ms
        })
        tray.emit('should-update')
      }).catch(err => {
        this.update({id: srv.id}, {
          delay : 100000
        })
        tray.emit('should-update')
      })

    })
  }
}


V2Ray.ServerManager = ServerManager

export default V2Ray