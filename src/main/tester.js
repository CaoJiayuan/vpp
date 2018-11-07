const dns = require('dns')

const np = require('net-ping')
const session = np.createSession()

export function ping (address) {
  return new Promise((resolve, reject) => {
    dns.lookup(address, (err, ip) => {
      if (err) {
        reject(err)
      } else {
        session.pingHost(ip , (e, b, sent, rcvd) => {
          if (e === null) {
            resolve(rcvd - sent)
          } else  {
            reject(e)
          }
        })
      }
    })
  })
}