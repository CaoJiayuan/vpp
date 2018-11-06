var os = require('os')

const platform = os.platform()

export const win = platform === 'win32'
export const macOS = platform === 'darwin'
export const linux = platform === 'linux'

export function onWin (cb) {
  if (win) {
    cb()
  }
}
export function onMacOS (cb) {
  if (macOS) {
    cb()
  }
}
export function onLinux (cb) {
  if (linux) {
    cb()
  }
}