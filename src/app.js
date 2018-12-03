'use strict'
import { lang } from './lang'
import { ipcMain } from 'electron'

import { tray } from './main/tray'

import { send } from './main'

import { ping } from './main/tester'
import { win } from './main/platform'
import { sendTo } from './utils'
import DB from './db'

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
const _ = require('lodash')

const CORE_VERSION = '4.7.0'

class V2Ray {

  constructor (workDir) {
    this.workDir = workDir
    this.coreDir = path.join(workDir, 'v2ray')
    this.configPath = path.join(this.workDir, 'config.json')
    this.pidFile = path.join(workDir, 'v2ray.pid')
    this.started = fs.existsSync(this.pidFile)
    //this.installed = false
  }

  get installed () {
    return fs.existsSync(this.coreDir)
  }

  static downloadUrl () {
    let type = 'macos'
    if (process.platform === 'win32') {
      type = 'windows-64'
    }

    if (process.platform === 'linux') {
      type = 'linux-64'
    }

    return `https://github.com/v2ray/v2ray-core/releases/download/v${CORE_VERSION}/v2ray-${type}.zip`
  }

  static formatLine (line, type) {
    let time = dayjs().format('YYYY-MM-DD HH:mm:ss')
    return `[${time}][${type}] ${line}`
  }

  static onInstalled () {
    //this.installed = true
    tray.emit('should-update')
  }

  checkCoreUpdate () {
    this.version().then(v => {
      request('https://api.github.com/repos/v2ray/v2ray-core/releases/latest', (err, resp, body) => {

      })
    })
  }

  init (dbPath) {
    dbPath = dbPath || path.join(this.workDir, 'db.json')
    this.db = new DB(dbPath, {
      servers: [],
      users: [],
      groups: [],
      config: {
        autoConnect: false,
        currentServer: null,
        locale: 'zh_CN'
      }
    })

    this.serverManager = new ServerManager(this)
    const configDBAdapter = new FileSync(this.configPath)
    this.configDB = new DB(this.configPath, {
      'log': {
        'loglevel': 'warning'
      },
      'inbounds': [
        {
          'port': 3080,
          'listen': '127.0.0.1',
          'protocol': 'socks',
          'settings': {
            'auth': 'noauth'
          }
        },
        {
          'port': 3087,
          'listen': '127.0.0.1',
          'protocol': 'http',
          'settings': {
            'auth': 'noauth'
          }
        }
      ],
      'outbound': {
        'protocol': 'vmess',
        'settings': {},
        'tag': 'direct'
      }
    })
  }

  start () {
    return new Promise((resolve, reject) => {
      this.ps = spawn('./v2ray', ['-config', this.configPath], {
        cwd: this.coreDir
      })
      this.ps.stdout.on('data', data => {
        if (data.toString().indexOf('started') > -1) {
          this.log(data, 'system')
          this.onStarted()
          resolve()
          fs.writeFile(this.pidFile, this.ps.pid, err => {})
        } else if (data.toString().indexOf('fail') > -1) {
          this.log(data, 'system')
        }
        send('v2ray.log', data.toString())

      })
      this.ps.on('exit', (code, signal) => {
        this.log('V2Ray core stopped\n', 'system')
        this.stopped()
        send('v2ray.log', 'V2Ray core stopped')
      })
    })
  }

  setting (key, value) {
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
          this.stopped()
          resolve(code)
        })
        this.ps.kill()
      } else {
        this.stopped()
        resolve()
      }
    })
  }

  onStarted () {
    this.started = true
    tray.emit('should-update')
    send('v2ray.started', true)
  }

  stopped () {
    this.started = false
    tray.emit('should-update')
    send('v2ray.started', false)
  }

  restart () {
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

  version (beforeStart, onProcess) {
    return this.install(beforeStart, onProcess).then(data => {
      return new Promise(resolve => {
        let version = spawn('./v2ray', ['-version'], {
          cwd: this.coreDir
        })
        version.stdout.on('data', data => {
          let v = data.toString().split('(', 2)[0].trim()
          this.db.set('version', v)
          V2Ray.onInstalled()
          resolve(v)
        })
      })
    })
  }

  install (onStart, onProcess) {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(this.coreDir)) {
        if (!fs.existsSync(this.workDir)) {
          fs.mkdirSync(this.workDir, 775)
        }
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
        this.log(`downloading v2ray core, from [${url}]\n`, 'system')
        send('v2ray.install.state', lang('downloading_core'))
        send('v2ray.install.error', false)

        let stream = progress(request(url, {
          //  proxy: 'http://127.0.0.1:1087'
        })).on('progress', state => {
          send('v2ray.progress', state.percent * 100)
          onProcess && onProcess(state.percent)
        }).on('error', err => {
          this.log(`download error: ${err}\n`, 'system')
          send('v2ray.install.state', lang('downloading_core_error') + err)
          send('v2ray.install.error', true)
          reject()
        }).pipe(file)
        stream.on('finish', () => {
          send('v2ray.progress', 100)
          send('v2ray.install.state', lang('extracting_core'))
          send('v2ray.install.error', false)

          extract().on('finish', () => {
            fs.unlink(zip, err => {
              this.log(`unzip error: ${err}\n`, 'system')
            })
            if (!win) {
              spawn('chmod', ['+x', 'v2ray'], {
                cwd: this.coreDir
              })
              spawn('chmod', ['+x', 'v2ctl'], {
                cwd: this.coreDir
              })
            }
            send('v2ray.installed', true)
            send('v2ray.install.error', false)

            resolve()
          })
        })
      } else {
        resolve()
      }
    })
  }

  handleIpc () {
    sendTo('v2ray.server', () => {
      return this.serverManager.current()
    })
    sendTo('v2ray.started', () => {
      return this.started
    })
    sendTo('v2ray.servers', () => {
      return this.serverManager.servers()
    })
    sendTo('v2ray.users', () => {
      return this.serverManager.users()
    })
    sendTo('v2ray.config', () => {
      let inbounds = this.configDB.get('inbounds').value()
      let socks5 = inbounds[0] || {}
      let http = inbounds[1] || {}
      return {
        listen: socks5.listen,
        socks5_port: socks5.port,
        http_port: http.port,
      }
    })
    sendTo('v2ray.installed', () => {
      return this.installed
    })
    ipcMain.on('v2ray.select', (e, data) => {
      this.serverManager.select(data)
    })
    ipcMain.on('config.save', (e, data) => {
      let inbounds = [];
      inbounds.push({
        'port': data.socks5_port,
        'listen': data.listen,
        'protocol': 'socks',
        'settings': {
          'auth': 'noauth'
        }
      })
      data.http_port && inbounds.push({
        'port': data.http_port,
        'listen': data.listen,
        'protocol': 'http',
        'settings': {
          'auth': 'noauth'
        }
      })
      this.configDB.set('inbounds', inbounds)
      this.started && this.restart()
    })
    ipcMain.on('v2ray.add', (e, data) => {
      this.serverManager.save(data)
    })
    ipcMain.on('v2ray.delete', (e, data) => {
      this.serverManager.remove(data)
    })
    ipcMain.on('v2ray.install', (e, data) => {
      this.install()
    })
    ipcMain.on('users.add', (e, data) => {
      this.serverManager.saveUser(data)
    })
    ipcMain.on('users.remove', (e, data) => {
      this.serverManager.removeUser(data)
    })
    sendTo('v2ray.users', () => {
      return this.serverManager.users()
    })
  }

}

class ServerManager {
  constructor (app) {
    this.app = app
  }

  static onServerChanged (srv) {
    send('v2ray.server', srv)
    tray.emit('should-update')
  }

  save (server) {
    let servers = this.app.db.model('servers')
    let srv
    if (server.id) {
      srv = servers.where({id: server.id}).update(server)
    } else {
      srv = servers.create(server)
    }

    if (this.servers().length === 1) {
      this.select(srv)
    }
    this.serversChange()

    return srv
  }

  saveUser (user) {
    let users = this.app.db.model('users')
    let u
    if (user.id) {
      u = users.where({id: user.id}).update(user)
    } else {
      u = users.create(user)
    }

    this.usersChange()
    return u
  }

  remove (id) {
    this.app.db.get('servers').remove({id}).write()
    this.serversChange()
  }

  serversChange () {
    send('v2ray.servers', this.servers())
    tray.emit('should-update')
  }

  usersChange () {
    send('v2ray.users', this.users())
  }

  update (where, data) {
    this.app.db.get('servers')
      .find(where)
      .assign(data)
      .write()
  }

  servers () {
    return this.app.db.model('servers').get()
  }

  users () {
    let servers = this.servers()
    return this.app.db.model('users').get().map(u => {
      u.deleteable = servers.filter(srv => srv.users.indexOf(u.id) > -1).length < 1

      return u
    })
  }

  removeUser (id) {
    this.app.db.get('users').remove({id}).write()
    this.usersChange()
  }

  groups () {
    let gs = this.app.db.model('groups').get().map(g => {
      g.servers = this.app.db.get('servers').filter(s => s.group_id === g.id).value()
      return g
    })

    gs.unshift({
      id: 'default',
      name: lang('default_group'),
      servers: this.app.db.get('servers').filter(s => !s.group_id).value()
    })

    return gs
  }

  select (srv) {
    let outbound = this.app.configDB.get('outbound')
    let server = _.clone(srv)
    server.users = server.users.map(u => {
      if (typeof u === 'string') {
        let filter = this.users().filter(user => user.id === u).map(us => {
          us.id = us.uuid
          return us
        })

        if (filter.length < 1) {
          return u
        }

        return filter[0]
      }
      return u
    })

    outbound.set('settings.vnext', [
      server
    ]).write()

    let options = server.options
    options.tlsSettings = {
      serverName: server.address,
      allowInsecure: options.allowInsecure
    }
    outbound.set('streamSettings', options).write()
    this.app.setting('currentServer', server.id)
    if (this.app.setting('autoConnect') || this.app.started) {
      this.app.restart()
    }
    ServerManager.onServerChanged(server)
  }

  test () {
    this.servers().forEach(srv => {
      ping(srv.address).then(ms => {
        this.update({id: srv.id}, {
          delay: ms
        })
        tray.emit('should-update')
        this.currentId() === srv.id && this.onChangeCurrent()
        send('v2ray.servers', this.servers())
      }).catch(err => {
        this.update({id: srv.id}, {
          delay: false
        })
        tray.emit('should-update')
        this.currentId() === srv.id && this.onChangeCurrent()
        send('v2ray.servers', this.servers())
      })
    })
  }

  find (id) {
    return this.app.db.model('servers').find(id)
  }

  current () {
    return this.find(this.app.setting('currentServer'))
  }

  currentId () {
    return this.app.setting('currentServer')
  }

  onChangeCurrent () {
    ServerManager.onServerChanged(this.current())
  }
}

V2Ray.ServerManager = ServerManager

export default V2Ray
