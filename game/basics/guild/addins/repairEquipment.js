const story = require('../../story/story')

module.exports = (guild) => {
  guild.ship.repairEquipment = ({ type, index, add, newRepairLevel }) => {
    const equipment = guild.ship.equipment[type][index]
    if (!equipment) {
      return {
        ok: false,
        message: story.repair.equipment.notFound()
      }
    }

    if (add) equipment.repair += add
    if (newRepairLevel) equipment.repair = newRepairLevel
    if (equipment.repair > 1) equipment.repair = 1
    equipment.repaired = Date.now()

    guild.saveNewDataToDb()
    return {
      ok: true,
      message: story.repair.equipment.success(
        equipment.displayName,
        equipment.repair
      ),
      equipment
    }
  }
}
