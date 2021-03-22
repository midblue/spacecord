const send = require(`../actions/send`)
const { log, canEdit } = require(`../botcommon`)
const Discord = require(`discord.js-light`)

module.exports = {
  tag: `look`,
  pm: true,
  documentation: {
    name: `look`,
    value: `Look out the window.`,
    emoji: `👀`,
    category: `interaction`,
    priority: 0,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:look|lookaround)$`, `gi`).exec(
      content,
    )
  },
  async action({ msg, settings, client, ship }) {
    log(msg, `Look Around`, msg.guild?.name)

    const scanRes = await ship.scanArea(true) // eyesOnly = true
    send(msg, scanRes.message)
    if (await canEdit(msg))
      msg.delete().catch((e) => {
        console.trace()
        console.log(e)
      })
  },
}
