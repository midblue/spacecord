const defaults = {
  type: `scanner`,
  description: ``,
  mass: 200,
  baseHp: 10,
  range: 0.2,
  repairDifficulty: 1,
  durabilityLostOnUse: 0.04,
  baseCost: 30,
}

// * get all exports from files in this folder
const fs = require(`fs`)
const addins = {}
fs.readdir(__dirname, (err, files) => {
  files.forEach((file) => {
    if (!file.endsWith(`.js`) || file === `index.js`) return
    addins[file.substring(0, file.length - 3)] = {
      id: file.substring(0, file.length - 3),
      ...defaults,
      ...require(`./${file}`),
    }
  })
  // console.log('addins', addins)
})

module.exports = addins
