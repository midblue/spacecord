const commands = require(`../commands`)

module.exports = async ({ msg, client }) => {
  await commands.test({
    msg,
    client
  })
}
