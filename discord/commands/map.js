const send = require(`../actions/send`)
const { log } = require(`../botcommon`)
const Discord = require(`discord.js-light`)
const generateImage = require(`../../imageGen/generateImage`)

module.exports = {
  tag: `map`,
  pm: true,
  delete: true,
  documentation: {
    name: `map`,
    value: `The ship's map of its discoveries.`,
    emoji: `🗺`,
    category: `ship`,
    priority: 40,
  },
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:map|viewmap|seemap|lookatmap)$`,
      `gi`,
    ).exec(content)
  },
  async action({ msg, guild }) {
    log(msg, `Map`, msg.guild?.name)

    send(
      msg,
      new Discord.MessageAttachment(
        await generateImage(`map`, {
          guilds: [guild.saveableData()],
          planets: guild.context.planets
            .filter((p) => guild.ship.seen.planets.includes(p.name))
            .map((p) => ({ ...p, context: undefined })),
          buffer: 0.2,
        }),
        `map.png`,
      ),
    )
  },
}
