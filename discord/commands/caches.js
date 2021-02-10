const send = require('../actions/send')
const { log } = require('../botcommon')
const awaitReaction = require('../actions/awaitReaction')
const Discord = require('discord.js-light')
const { usageTag } = require('../../common')
const getCache = require('../actions/getCache')

module.exports = {
  tag: 'caches',
  documentation: {
    value: `Check for nearby caches.`,
    emoji: '📦',
    category: 'interaction',
    priority: 40,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:caches?)$`, 'gi').exec(content)
  },
  async action({ msg, guild }) {
    log(msg, 'Caches', msg.guild.name)

    const caches = guild.context.scanArea({
      x: guild.ship.location[0],
      y: guild.ship.location[1],
      range: guild.ship.interactRadius,
      excludeIds: guild.guildId,
    })?.caches

    if (!caches || !caches.length)
      return send(
        msg,
        'No nearby caches found within ' +
          guild.ship.interactRadius +
          process.env.DISTANCE_UNIT +
          '.',
      )

    caches.forEach(async (cache) => {
      const embed = new Discord.MessageEmbed()
        .setColor(process.env.APP_COLOR)
        .setTitle(
          '📦 ' +
            cache.amount.toFixed(2) +
            (cache.type === 'credits'
              ? ''
              : ' ' + process.env.WEIGHT_UNIT_PLURAL + ' of') +
            ' ' +
            cache.emoji +
            cache.displayName,
        )

      const availableActions = [
        {
          emoji: '✋',
          label: 'Grab the cache! ' + usageTag(0, 'cache'),
          async action({ user, msg, guild }) {
            getCache({
              cache,
              msg,
              guild,
            })
          },
        },
      ]

      const sentMessage = (await send(msg, embed))[0]
      await awaitReaction({
        msg: sentMessage,
        reactions: availableActions,
        embed,
        guild,
      })
    })
  },
}
