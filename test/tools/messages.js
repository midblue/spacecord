const msg = {
  guild: {
    name: `Test Guild`,
    id: `605053799404666880`,
  },
  author: {
    username: `Test User`,
    id: `244651135984467968`,
  },
  channel: {
    id: `816361901549420615`,
    async send(message) {
      console.log(`Test sent message:`, message)
    },
  },
}

module.exports = { msg }
