import { app, Menu, Tray, MenuItem,NativeImage } from 'electron'
import { lang } from '../lang'

let tray = null
let contextMenu = null
let version = lang('check_version')

let buildFromTemplate = function (v2ray, cb) {
  let template = [
    {
      label: version,
      type: 'normal',
      enabled: false
    },
    {
      label: v2ray.started ? lang('close') : lang('open'),
      type: 'normal',
      click: () => v2ray.started ? v2ray.stop() : v2ray.start(),
      enabled: v2ray.installed
    },
    {
      label: '-',
      type: 'separator'
    },
    {
      label: lang('show_app'), type: 'normal', click: () => app.emit('show')
    },
    {
      label: lang('auto_connect'),
      type: 'checkbox', checked: v2ray.setting('autoConnect'),
      click: item => v2ray.setting('autoConnect', item.checked) //config.assign({autoConnect: item.checked}).write()
    },
    {
      label: '-',
      type: 'separator'
    },
    {
      label: lang('groups'),
      type: 'normal', enabled: false
    },
  ]

  let groups = createServersMenu(v2ray)
  template = template.concat(groups)
  template.push({
    label: '-',
    type: 'separator'
  })
  template.push({
    label: lang('test'),
    type: 'normal',
    click: () => v2ray.serverManager.test()
  })
  cb && cb(template)
  template.push({
    label: '-',
    type: 'separator'
  },)
  template.push({
    label: lang('quit'), type: 'normal', click: () => app.quit()
  })
  return Menu.buildFromTemplate(template)
}
function updateTrayMenu (v2ray, cb) {
  contextMenu = buildFromTemplate(v2ray, cb)
  tray.setContextMenu(contextMenu)
}
let initTray = function (v2ray) {
  tray = new Tray(__static + '/icon.png')

  updateTrayMenu(v2ray)
}

export function createTray (v2ray) {
  if (tray === null) {
    initTray(v2ray)
    tray.setToolTip('vpp')
  }
  v2ray.version(() => {
    tray.setTitle(lang('downloading'))
  }, percent => {

  }).then(v => {
    tray.setTitle('')

    version = v;
    updateTrayMenu(v2ray)
  }).catch(err => console.log(err))


  tray.on('should-update', cb => {
    updateTrayMenu(v2ray, cb)
  })
  return tray
}

function createServersMenu (v2ray) {
  let manager = v2ray.serverManager
  return manager.groups().map(g => {
    return {
      label: g.name,
      submenu: Menu.buildFromTemplate(g.servers.sort((a, b) => a.delay > b.delay).map(srv => {
        let delay = srv.delay + ' ms'
        if ( srv.delay === false ) {
          delay = lang('timeout')
        }
        if (srv.delay === undefined) {
          delay = '';
        }
        return new MenuItem({
          label: (srv.remark || srv.address) + '    ' + delay,
          type: 'radio',
          checked: v2ray.setting('currentServer') === srv.id,
          click: () => manager.select(srv)
        })
      }))
    }
  })
}

export {
  tray
}
