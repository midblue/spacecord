const story = require(`../../story/story`)
const crewMember = require(`../../crew/crew`)
const { log } = require(`../../../gamecommon`)
const db = require(`../../../manager`).db

module.exports = (guild) => {
  guild.ship.addCrewMember = async (discordUser) => {
    const newMember = await crewMember.spawn(discordUser, guild)

    const addedCrewMember = await db.crewMembers.add({
      guildId: guild.id,
      userId: discordUser.id || discordUser.user.id,
      member: newMember,
    })
    if (!addedCrewMember) {
      log(
        `addCrew`,
        `Failed to add crew member (existing?)`,
        discordUser.id || discordUser.user.id,
        guild.id,
      )
      return {
        ok: false,
        message: story.crew.add.fail.existing(newMember.id),
      }
    }

    // success
    log(
      `addCrew`,
      `Added new member`,
      discordUser.id || discordUser.user.id,
      `to guild`,
      guild.name,
    )
    guild.ship.members.push(addedCrewMember)

    if (guild.ship.members.length === 1) {
      guild.ship.captain = newMember.id
      guild.saveNewDataToDb()
      return {
        ok: true,
        message: [
          story.crew.add.first(newMember, guild),
          story.prompts.startGame(),
        ],
      }
    }
    return {
      ok: true,
      message: story.crew.add.success(newMember, guild),
    }
  }
}
