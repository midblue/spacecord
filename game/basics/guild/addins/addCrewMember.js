const story = require('../../story/story')
const crewMember = require('../../crew/crew')
const { log } = require('../../../gamecommon')

module.exports = (guild) => {
  guild.ship.addCrewMember = async (discordUser) => {
    const newMember = await crewMember(discordUser)

    if (guild.ship.members.find((m) => m.id === newMember.id)) {
      log(
        'addCrew',
        `Attempted to add a member that already exists.`,
        newMember.id,
        guild.id,
      )
      return {
        ok: false,
        message: story.crew.add.fail.existing(newMember.id),
      }
    }

    // success
    guild.ship.members.push(newMember)
    log('addCrew', 'Added new member to guild', newMember.id, guild.guildName)
    if (guild.ship.members.length === 1)
      return {
        ok: true,
        message: [
          story.crew.add.first(newMember, guild),
          story.prompts.startGame(),
        ],
      }
    return { ok: true, message: story.crew.add.success(newMember, guild) }
  }
}
