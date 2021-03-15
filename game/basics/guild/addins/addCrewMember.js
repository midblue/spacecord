const story = require(`../../story/story`)
const crewMember = require(`../../crew/crew`)
const { log } = require(`../../../gamecommon`)

module.exports = (guild) => {
  guild.ship.addCrewMember = async (discordUser) => {
    // first, check for a user object for this discord user
    let user = await guild.context.db.user.get({ id: discordUser.id })

    // make the user if they don't exist yet
    if (!user) user = await guild.context.db.user.add({ id: discordUser.id })
    else if (user.memberships.find((m) => m.guildId === guild.id)) {
      console.log(`Attempted to double add`, user.id, `to guild`, guild.id)
      return {
        ok: false,
        message: story.crew.add.fail.existing(newMember.id),
      }
    }

    // make the new member and save it to the DB
    const newMember = await crewMember.spawn(guild)
    const addedCrewMember = await guild.context.db.crewMember.add({
      guildId: guild.id,
      userId: user.id,
      member: newMember,
    })
    crewMember.liveify(addedCrewMember, guild)
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
      `Added new crew member`,
      addedCrewMember.id,
      `for user`,
      user.id,
      `to guild`,
      guild.name,
    )

    // link the new member to the user object
    user.memberships.push({
      guildId: guild.id,
      crewMemberId: addedCrewMember.crewMemberId || addedCrewMember.id,
    })
    if (user.memberships.length === 1) user.activeGuild = guild.id
    await guild.context.db.user.update({
      id: user.id,
      updates: { memberships: user.memberships, activeGuild: user.activeGuild },
    })

    // link the new member to the guild object
    guild.members.push({
      userId: user.id,
      crewMemberId: addedCrewMember.crewMemberId,
    })
    guild.ship.members.push(addedCrewMember)
    // console.log(`on add`, guild.ship.members)
    if (guild.ship.members.length === 1) {
      guild.ship.captain = user.id
      await guild.saveNewDataToDb()
      return {
        ok: true,
        message: [story.crew.add.first(user), story.prompts.startGame()],
      }
    }
    await guild.saveNewDataToDb()

    return {
      ok: true,
      message: story.crew.add.success(user, guild),
      crewMember: addedCrewMember,
    }
  }
}
