const cargoData = require(`./cargo`)

module.exports = {
  liveify(cache) {
    console.log(cache)
    Object.keys(cargoData[cache.type]).forEach(
      (key) => (cache[key] = cargoData[cache.type][key]),
    )
  },
}
