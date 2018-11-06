import { Menu, Tray } from 'electron'
import { lang } from '../lang'

let tray = null

export function createTray (app, window, v2ray) {
  let db = v2ray.db
  let config = db.get('config')

  if (tray === null) {
    tray = new Tray(__static + '/icon.png')
    const contextMenu = Menu.buildFromTemplate([
      {label: lang('show_app'), type: 'normal', click: () => app.emit('show')},
      {
        label: lang('auto_connect'),
        type: 'checkbox', checked: config.value().autoConnect,
        click: item => config.assign({autoConnect: item.checked}).write()
      },
      {
        label: lang('services'),
        submenu : createServersMenu(db, config)
      },
      {label: lang('quit'), type: 'normal', click: () => app.quit()}
    ])
    tray.setToolTip('vpp')
    tray.setContextMenu(contextMenu)
  }

  return tray
}

function createServersMenu (db, config) {
  return db.get('servers').value().map(srv => {
    return {
      label: srv.remark || srv.address,
      type: 'radio',
      checked: config.value().currentServer === srv.id,
      click: () => config.assign({currentServer:srv.id}).write()
    }
  })
}