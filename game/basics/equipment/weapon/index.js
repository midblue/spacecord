const defaults = {
  type: 'weapon',
  description: '',
  range: 2,
  weight: 70,
  baseHp: 20,
  durabilityLostOnUse: 0.03,
  accuracy: 0.3,
  hitPercent (distance, enemyShip) {
    return (
      this.repair *
      this.accuracy *
      (1 - distance / this.range) *
      (enemyShip ? 1 - enemyShip.equipment.chassis[0].agility : 1)
    )
  },
  repairDifficulty: 1,
  baseCost: 200,
  rechargeTime: 1
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
      ...require(`./${file}`)
    }
  })
  // console.log(addins.length, 'addins', addins)
})

module.exports = addins
