const story = require(`../../story/story`)

const equipmentTypeToSkill = {
  engine: `piloting`,
  telemetry: `navigation`,
}

module.exports = (guild) => {
  guild.ship.getRequirements = (equipmentType, settings = {}, member) => {
    const requirements = settings.requirements || {}
    guild.ship.equipment
      .find((e) => e.equipmentType === equipmentType)
      .list.forEach((equipment) => {
        for (const r of Object.keys(equipment.requirements || {})) {
          if (equipment.requirements[r] > (requirements[r] || 1)) {
            requirements[r] = equipment.requirements[r]
          }
        }
      })
    let ok = true
    if (
      member &&
      Object.keys(requirements || {}).find(
        (skill) =>
          requirements[skill] >
          (member?.level?.find((l) => l.skill === skill).level || 1),
      )
    )
      ok = false

    return {
      ok,
      requirements,
      message: ok
        ? ``
        : story.action.doesNotMeetRequirements(requirements, member),
    }
  }
}
