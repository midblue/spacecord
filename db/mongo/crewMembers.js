const { Guild, Ship, CrewMember } = require(`./models`)
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
    const g = await getGuild({ id: guildId })
    if (!g)
      return console.log(
        `Failed to find guild`,
        guildId,
        `to add member`,
        member,
      )

    let user = await getUser({ id: userId })
    if (!user) user = await addUser({ id: userId })
    else if (user.memberships[guildId])
      return console.log(`Attempted to double add`, userId, `to guild`, guildId)

    const crewMember = new CrewMember({ ...member })
    user.memberships[guildId] = crewMember._id
  },

  async update({ id, memberData }) {
    CrewMember.findOneAndUpdate({ _id: id }, { ...memberData }, (e, res) => {
      if (e) console.log(`error updating crewMember:`, e)
      // console.log('crewMember update result:', res)
    })
  },
}