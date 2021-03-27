const fs = require(`fs`)
const story = require(`../story/story`)
const equipment = {}

// * get all exports from files in subfolders
fs.readdir(__dirname, (err, files) => {
  for (let file of files) {
    if (file.indexOf(`.`) !== -1) continue
    equipment[file] = require(`./${file}/index.js`)
  }
})

const liveify = (item) => {
  item.useDurability = function (presetPercentage) {
    const durabilityToUse = presetPercentage || this.durabilityLostOnUse || 0.01
    this.repair -= durabilityToUse
    if (this.repair < 0) this.repair = 0
    if (this.repair === 0)
      return {
        ok: false,
        repair: this.repair,
        message: story.repair.equipment.breakdown(this.displayName),
      }
    return { ok: true, repair: this.repair }
  }
  return item
}

module.exports = { equipment, liveify }
