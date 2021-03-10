const { CrewMember, User, Guild } = require(`./models`)
const { get: getUser } = require(`./user`)
const mongoose = require(`mongoose`)

module.exports = {
  async get({ id }) {
    const crewMember = await CrewMember.findOne({
      _id: id,
    })
    if (!crewMember) return
    return {
      ...crewMember.toObject(), // * this is for general usage in the app — makes things easier to call them by their user id
      crewMemberId: crewMember._id,
      id: crewMember.userId,
    }
  },

  // async getBy({ userId, guildId }) {
  //   const user = await getUser({ id: userId })
  //   if (!user) return console.log(`Failed to find user`, userId)
  //   const crewMember = await CrewMember.findOne({
  //     _id: user.memberships.find((m) => m.guildId === guildId).crewMemberId,
  //   })
  //   return crewMember
  // },

  async add({ guildId, userId, member }) {
    const crewMember = new CrewMember({
      ...member,
      userId,
      guildId,
      _id: `${mongoose.Types.ObjectId()}`,
    })
    await crewMember.save()
    return {
      ...crewMember.toObject(), // * this is for general usage in the app — makes things easier to call them by their user id
      crewMemberId: crewMember._id,
      id: crewMember.userId,
    }
  },

  async update({ id, updates }) {
    updates = { ...updates }
    const crewMember = await CrewMember.findOne({ _id: id })
    delete updates.id
    delete updates.userId
    delete updates.crewMemberId
    delete updates._id
    delete updates.__v
    Object.keys(updates).forEach((key) => (crewMember[key] = updates[key]))
    await crewMember.save()
    // console.log(`crewMember update result`, crewMember)
    return crewMember
  },

  async remove(id) {
    console.log(`db: removing crewMember`, id)
    // remove from user, guild, and the crewmember object itself
    const crewMember = await CrewMember.findOne({
      _id: id,
    })
    if (!crewMember)
      return {
        ok: false,
        message: `Attempted to remove crew member that didn't exist: ` + id,
      }

    const user = await User.findOne({ _id: crewMember.userId })
    user.memberships.splice(
      user.memberships.findIndex((m) => m.crewMemberId === id),
      1,
    )
    user.save()

    const guild = await Guild.findOne({ _id: crewMember.guildId })
    guild.members.splice(
      guild.members.findIndex((m) => m.crewMemberId === id),
      1,
    )
    guild.save()

    const res = await CrewMember.deleteOne(
      { _id: id },
      (e) => e && console.log(`ship delete error`, e),
    )
    return {
      ok: res.deletedCount,
      message: `Deleted ` + res.deletedCount + ` ship/s.`,
    }
  },
}
