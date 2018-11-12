const np = require('ping')

export function ping (address) {
  return np.promise.probe(address).then(res => {
    if (res.avg === 'unknown') {
      return false
    }

    return parseInt(res.avg);
  })
}
