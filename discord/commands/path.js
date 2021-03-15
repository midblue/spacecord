const send = require(`../actions/send`)
const { log } = require(`../botcommon`)
const Discord = require(`discord.js-light`)
const generateImage = require(`../../imageGen/generateImage`)

module.exports = {
  tag: `path`,
  pm: true,
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

    const sentImage = (
      await send(
        msg,
        new Discord.MessageAttachment(
          await generateImage(`path`, {
            ship: guild.saveableData().ship,
            planets: guild.context.planets
              .filter((p) => guild.ship.seen.planets.includes(p.name))
              .map((p) => ({ ...p, context: undefined })),
          }),
          `path.png`,
        ),
      )
    )[0]

    // const res = guild.ship.getMap()
    // return send(msg, res.message)
  },
}
