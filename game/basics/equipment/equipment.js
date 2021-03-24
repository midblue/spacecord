// * get all exports from files in subfolders
const fs = require(`fs`)
const addins = {}
fs.readdir(__dirname, (err, files) => {
  files.forEach((file) => {
    if (file.indexOf(`.`) !== -1) return
    addins[file] = require(`./${file}/index.js`)
  })
})

module.exports = addins
