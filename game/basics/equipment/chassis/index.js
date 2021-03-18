const defaults = {
  type: `chassis`,
  baseCost: 2000,
  interactRadius: 0.1,
  mass: 10000,
  baseHp: 40,
  repairDifficulty: 1,
  agility: 0.5,
  maxMass: 25000,
  emoji: `🚀`,
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
  // console.log(addins.length, 'addins', addins)
})

module.exports = addins
