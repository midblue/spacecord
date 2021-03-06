const { User } = require(`./models`)

module.exports = {
  async add({ id }) {
    const user = new User({ id })
    await user.save()
    console.log(`Added user to database: ${id}`)
    return user
  },

  async get({ id }) {
    const user = await User.findOne({ _id: id })
    if (user) return user.toObject()
  },

  async update({ id, updates }) {
    const user = await User.findOne({ _id: id })
    delete updates.id
    delete updates._id
    delete updates.__v
    Object.keys(updates).forEach((key) => (user[key] = updates[key]))
    await user.save()
    // console.log(`user update result`, user)
    return user
  },
}
