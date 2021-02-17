const cargoData = require('./cargo')

module.exports = {
  liveify (cache) {
    Object.keys(cargoData[cache.type]).forEach(
      (key) => (cache[key] = cargoData[cache.type][key])
    )
  }
}
