const send = require(`../actions/send`)
const { log } = require(`../botcommon`)
const Discord = require(`discord.js-light`)
const generateImage = require(`../../imageGen/generateImage`)
const { ship } = require(`../../game/basics/story/story`)

module.exports = {
  tag: `path`,
  pm: true,
  delete: true,
  documentation: {
    name: `path`,
    value: `The ship's recent path`,
    emoji: `📈`,
    category: `ship`,
    priority: 30,
  },
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:path|recentpath|shippath|recent)$`,
      `gi`,
    ).exec(content)
  },
  async action({ msg, guild }) {
    log(msg, `Path`, msg.guild?.name)

    await send(
      msg,
      new Discord.MessageAttachment(
        await generateImage(`path`, {
          guilds: [guild.saveableData()],
          planets: guild.context.planets
            .filter((p) => guild.ship.seen.planets.includes(p.name))
            .map((p) => ({ ...p, context: undefined })),
          focus: `path`,
          buffer: 0.2,
        }),
        `path.png`,
      ),
    )
  },
}
