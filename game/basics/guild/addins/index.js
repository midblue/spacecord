// * get all exports from files in this folder
const fs = require(`fs`)
const addins = []
fs.readdir(__dirname, (err, files) => {
  files.forEach((file) => {
    if (!file.endsWith(`.js`) || file === `index.js`)
      return
    addins.push(require(`./${file}`))
  })
  // console.log(addins.length, 'addins')
})

module.exports = addins
