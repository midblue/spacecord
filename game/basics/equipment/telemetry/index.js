const { liveify } = require(`../equipment`)

const defaults = {
  type: `telemetry`,
  displayName: `telemetry`,
  emoji: `📽`,
  description: ``,
  mass: 700,
  baseHp: 10,
  repairDifficulty: 1,
  powerUse: 2,
  durabilityLostOnUse: 0.02,
  baseCost: 80,
}

// * get all exports from files in this folder
const fs = require(`fs`)
const addins = {}
fs.readdir(__dirname, (err, files) => {
  files.forEach((file) => {
    if (!file.endsWith(`.js`) || file === `index.js`) return
    addins[file.substring(0, file.length - 3)] = liveify({
      id: file.substring(0, file.length - 3),
      ...defaults,
      ...require(`./${file}`),
    })
  })
  // console.log(addins.length, 'addins', addins)
})

// todo some of these have "auto-notify" when you come in range of a new thing

module.exports = addins
