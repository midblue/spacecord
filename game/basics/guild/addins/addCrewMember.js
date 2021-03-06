const story = require(`../../story/story`)
const crewMember = require(`../../crew/crew`)
const { log } = require(`../../../gamecommon`)
const db = require(`../../../manager`).db

module.exports = (guild) => {
  guild.ship.addCrewMember = async (discordUser) => {
    // first, check for a user object for this discord user
    let user = await db.users.get({ id: discordUser.id })

    // make the user if they don't exist yet
    if (!user) user = await db.users.add({ id: discordUser.id })
    else if (user.memberships.find((m) => m.guildId === guild.id))
      return console.log(`Attempted to double add`, userId, `to guild`, guildId)

    // make the new member and save it to the DB
    const newMember = await crewMember.spawn(guild)
    const addedCrewMember = await db.crewMembers.add({
      guildId: guild.id,
      userId: user.id,
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

    // link the new member to the user object
    user.memberships.push({
      guildId: guild.id,
      crewMemberId: addedCrewMember.id,
    })
    await db.users.update({
      id: user.id,
      updates: { memberships: user.memberships },
    })

    // link the new member to the guild object
    guild.members.push({ userId: user.id, crewMemberId: addedCrewMember.id })
    await guild.saveNewDataToDb()
    guild.ship.members.push(addedCrewMember)

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

    if (guild.ship.members.length === 1) {
      guild.ship.captain = newMember.id
      await guild.saveNewDataToDb()
      return {
        ok: true,
        message: [story.crew.add.first(user), story.prompts.startGame()],
      }
    }
    return {
      ok: true,
      message: story.crew.add.success(user, guild),
      crewMember: addedCrewMember,
    }
  }
}
