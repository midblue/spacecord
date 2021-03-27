const { liveify } = require(`../equipment`)

const defaults = {
  type: `engine`,
  description: ``,
  mass: 1000,
  baseHp: 30,
  repairDifficulty: 1,
  durabilityLostOnUse: 0.005,
  baseCost: 200,
  maxThrust: 300,
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

module.exports = addins
