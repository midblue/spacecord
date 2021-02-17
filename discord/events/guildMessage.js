const commands = require('../commands/index')

module.exports = async ({ msg, client }) => {
  await commands.test({
    msg,
    client
  })
}
