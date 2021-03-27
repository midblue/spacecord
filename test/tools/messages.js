const msg = {
    guild: {
      name: `Test Guild`,
      id: `605053799404666880`,
      members: {
        fetch({ user }) {
          return [
            {
              username: `Test User`,
              id: `244651135984467968`,
            },
          ].find((u) => u.id === user)
        },
      },
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
  },
  msg2 = {
    guild: {
      name: `Test Guild 2`,
      id: `805015489632796692`,
      members: {
        fetch({ user }) {
          return [
            {
              username: `Test User`,
              id: `244651135984467968`,
            },
          ].find((u) => u.id === user)
        },
      },
    },
    author: {
      username: `Test User`,
      id: `244651135984467968`,
    },
    channel: {
      id: `825358889951297587`,
      async send(message) {
        console.log(`Test sent message:`, message)
      },
    },
  }

module.exports = { msg, msg2 }
