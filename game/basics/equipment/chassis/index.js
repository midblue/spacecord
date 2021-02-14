const defaults = {
  type: 'chassis',
  baseCost: 2000,
  interactRadius: 1.5,
  weight: 150,
  baseHp: 40,
  repairDifficulty: 1,
  agility: 0.5,
  maxWeight: 1000,
  emoji: '🚀',
}

// * get all exports from files in this folder
const fs = require('fs')
const addins = {}
fs.readdir(__dirname, (err, files) => {
  files.forEach((file) => {
    if (!file.endsWith('.js') || file === 'index.js') return
    addins[file.substring(0, file.length - 3)] = {
      id: file.substring(0, file.length - 3),
      ...defaults,
      ...require(`./${file}`),
    }
  })
  // console.log(addins.length, 'addins', addins)
})

module.exports = addins
