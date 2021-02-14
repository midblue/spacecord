const defaults = {
  type: 'transceiver',
  description: ``,
  weight: 50,
  baseHp: 6,
  maxGarble: 0.8,
  repairDifficulty: 1,
  durabilityLostOnUse: 0.1,
  baseCost: 120,
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
