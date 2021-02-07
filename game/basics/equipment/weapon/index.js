const defaults = {
  type: 'weapon',
  range: 2,
  weight: 70,
  baseHp: 20,
  hitPercent(distance) {
    return this.repair * this.accuracy * (1 - distance / this.range)
  },
}

// * get all exports from files in this folder
const fs = require('fs')
const addins = {}
fs.readdir(__dirname, (err, files) => {
  files.forEach((file) => {
    if (!file.endsWith('.js') || file === 'index.js') return
    addins[file.substring(0, file.length - 3)] = {
      ...defaults,
      ...require(`./${file}`),
    }
  })
  // console.log(addins.length, 'addins', addins)
})

module.exports = addins
