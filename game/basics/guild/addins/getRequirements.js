const story = require('../../story/story')

const equipmentTypeToSkill = {
  engine: 'piloting',
  telemetry: 'navigation'
}

module.exports = (guild) => {
  guild.ship.getRequirements = (equipmentType, settings = {}, member) => {
    const requirements = settings.requirements || {}
    guild.ship.equipment[equipmentType].forEach((equipment) => {
      for (const r of Object.keys(equipment.requirements)) {
        if (equipment.requirements[r] > (requirements[r] || 0)) { requirements[r] = equipment.requirements[r] }
      }
    })
    let ok = true
    if (member) {
      if (
        Object.keys(requirements).find(
          (skill) => requirements[skill] > (member?.level?.[skill] || 0)
        )
      ) { ok = false }
    }
    return {
      ok,
      requirements,
      message: ok
        ? ''
        : story.action.doesNotMeetRequirements(requirements, member)
    }
  }
}
