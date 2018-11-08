import {ipcMain} from 'electron'

export function versionCompare(a, b) {
  if (a === b) {
    return 0;
  }
  let a_components = a.split('.')
  let b_components = b.split(".");
  let len = Math.min(a_components.length, b_components.length);
  for (let i = 0; i < len; i++) {
    if (parseInt(a_components[i]) > parseInt(b_components[i])) {
      return 1;
    }

    if (parseInt(a_components[i]) < parseInt(b_components[i])) {
      return -1;
    }
  }

  if (a_components.length > b_components.length) {
    return 1;
  }

  if (a_components.length < b_components.length) {
    return -1;
  }

  return 0;
}

export function sendTo(channel, data){
  ipcMain.on(channel, e => {

    if (typeof data === 'function') {
      let value = data()

      if (value instanceof Promise) {
        value.then(v => e.sender.send(channel, v))
      } else {
        e.sender.send(channel, value)
      }
    } else {
      e.sender.send(channel, data)
    }
  })
}

export function delayClass (server) {
  if (server.delay < 150) {
    return 'is-success'
  }
  if (server.delay >= 150 && server.delay < 300) {
    return 'is-warning'
  }
  if (server.delay >= 300 && server.delay < 500) {
    return 'is-info'
  }

  if (server.delay >= 500) {
    return 'is-danger'
  }
  return 'is-danger'
}
