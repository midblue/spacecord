const { CrewMember, User } = require(`./models`)
const { get: getUser, add: addUser } = require(`./users`)
const { get: getGuild } = require(`./guilds`)

module.exports = {
  async get({ userId, guildId }) {
    const user = await getUser({ id: userId })
    if (!user) return console.log(`Failed to find user`, userId)
    const crewMember = user.memberships[guildId]
    return crewMember
  },

  async add({ guildId, userId, member }) {
    const guild = await getGuild({ id: guildId })
    if (!guild)
      return console.log(
        `Failed to find guild`,
        guildId,
        `to add member`,
        member,
      )
    if (guild.members[userId])
      return console.log(
        `Attempted to double add user`,
        userId,
        `to guild`,
        guildId,
      )

    let user = await getUser({ id: userId })
    if (!user) user = await addUser({ id: userId })
    else if (user.memberships[guildId])
      return console.log(`Attempted to double add`, userId, `to guild`, guildId)

    const crewMember = new CrewMember({ ...member, userId })
    await crewMember.save()

    guild.members[userId] = `${crewMember.id}`
    guild.markModified(`members`)
    await guild.save()

    user.memberships[guildId] = `${crewMember.id}`
    user.markModified(`memberships`)
    await user.save()

    return crewMember
  },

  async update({ id, memberData }) {
    CrewMember.findOneAndUpdate({ _id: id }, { ...memberData }, (e, res) => {
      if (e) console.log(`error updating crewMember:`, e)
      // console.log('crewMember update result:', res)
    })
  },
}
