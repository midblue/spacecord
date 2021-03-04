const { User } = require(`./models`)

module.exports = {
  async add({ id, data }) {
    const user = new User({ id })
    await user.save()
    console.log(`Added user to database: ${id}`)
    return user
  },

  async get({ id }) {
    const user = await User.findOne({ _id: id })
    return user
  },
}
