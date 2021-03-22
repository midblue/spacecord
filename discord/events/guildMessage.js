const commands = require(`../commands`)

module.exports = async ({ msg, client }) => {
  // todo check for permissions here (and in PM too) and return if we don't have what we need
  // todo only listen in game channels
  await commands.test({
    msg,
    client,
  })
}
