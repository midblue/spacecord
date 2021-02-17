const defaults = {
  type: `armor`,
  description: ``,
  weight: 150,
  baseHp: 50,
  damageToArmorMultiplier: 0.5,
  armorCoverage: 0.5,
  repairDifficulty: 1,
  baseCost: 300
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
      ...require(`./${file}`)
    }
  })
  // console.log(addins.length, 'addins', addins)
})

module.exports = addins
