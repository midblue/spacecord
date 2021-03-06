const { CrewMember } = require(`./models`)
const { get: getUser } = require(`./users`)
const mongoose = require(`mongoose`)

module.exports = {
  async get({ userId, guildId }) {
    const user = await getUser({ id: userId })
    if (!user) return console.log(`Failed to find user`, userId)
    const crewMember = user.memberships[guildId]
    return crewMember
  },

  async add({ guildId, userId, member }) {
    const crewMember = new CrewMember({
      ...member,
      userId,
      guildId,
      _id: `${mongoose.Types.ObjectId()}`,
    })
    await crewMember.save()
    return crewMember
  },

  async update({ id, memberData }) {
    CrewMember.findOneAndUpdate({ _id: id }, { ...memberData }, (e, res) => {
      if (e) console.log(`error updating crewMember:`, e)
      // console.log('crewMember update result:', res)
    })
  },
}
