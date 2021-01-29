const commands = require('../commands/index')
const defaultServerSettings = require('../defaults/defaultServerSettings')

module.exports = async ({ msg, client, game }) => {
  await commands({
    msg,
    settings: defaultServerSettings,
    client,
    game,
  })
}
