const send = require('../actions/send')
const { log, username } = require('../botcommon')
const { capitalize, usageTag } = require('../../common')
const Discord = require('discord.js-light')
const awaitReaction = require('../actions/awaitReaction')
const jettison = require('../actions/jettison')

module.exports = {
  tag: 'cargo',
  documentation: {
    value: `See and edit the ship's cargo.`,
    emoji: '📦',
    category: 'ship',
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:cargo|c)$`, 'gi').exec(content)
  },
  async action({ msg, ship, guild }) {
    log(msg, 'Cargo', msg.guild.name)

    const actualCargo = ship.cargo.filter((c) => c.amount > 0.0001)
    if (guild.ship.credits)
      actualCargo.push({
        type: 'credits',
        displayName: 'Credits',
        amount: guild.ship.credits,
        emoji: '💳',
      })

    if (actualCargo.length === 0)
      return send(msg, `Your ship currently has no cargo at all.`)

    const currentCargoString = actualCargo
      .map(
        (c) =>
          `${c.emoji} ${c.displayName}: ${
            c.type === 'credits' ? Math.round(c.amount) : c.amount.toFixed(2)
          } ${c.type === 'credits' ? '' : process.env.WEIGHT_UNITS}`,
      )
      .join('\n')

    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`Cargo | ${ship.name}`)
      .setDescription(currentCargoString)

    const reactions = [
      {
        emoji: '🗑',
        label: 'Vote to Jettison Cargo ' + usageTag(0, 'poll'),
        action: async ({ msg, guild }) => {
          jettison({ msg, guild })
        },
      },
    ]

    const sentMessage = (await send(msg, embed))[0]
    awaitReaction({ msg: sentMessage, reactions, embed, guild })
  },
}
