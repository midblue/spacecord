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
    return user
  },
}
