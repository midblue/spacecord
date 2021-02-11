const send = require('../actions/send')
const { log } = require('../botcommon')
const {
  numberToEmoji,
  capitalize,
  positionAndAngleDifference,
  usageTag,
} = require('../../common')
const awaitReaction = require('../actions/awaitReaction')
const Discord = require('discord.js-light')
const story = require('../../game/basics/story/story')
const { interact } = require('../../game/basics/story/story')

module.exports = {
  tag: 'nearby',
  documentation: {
    name: 'nearby',
    value: `Inspect and interact with nearby ships, planets, etc.`,
    emoji: '👉',
    category: 'interaction',
    priority: 60,
  },
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:nearbyships?|nearby|near)$`,
      'gi',
    ).exec(content)
  },
  async action({
    msg,
    settings,
    game,
    ship,
    guild,
    authorCrewMemberObject,
    author,
    interactableGuilds,
  }) {
    log(msg, 'Nearby Ships', msg.guild.name)

    if (interactableGuilds === undefined)
      interactableGuilds = guild.context.scanArea({
        x: guild.ship.location[0],
        y: guild.ship.location[1],
        range: guild.ship.attackRadius(),
        excludeIds: guild.guildId,
      }).guilds

    const interactableCaches = guild.context.scanArea({
      x: guild.ship.location[0],
      y: guild.ship.location[1],
      range: guild.ship.tractorRadius(),
      excludeIds: guild.guildId,
    }).caches

    const interactablePlanets = guild.context.scanArea({
      x: guild.ship.location[0],
      y: guild.ship.location[1],
      range: guild.ship.interactRadius,
      excludeIds: guild.guildId,
    }).planets

    if (
      interactableGuilds.length +
        interactableCaches.length +
        interactablePlanets.length ===
      0
    )
      return send(msg, story.interact.nothing())

    interactableCaches.forEach(async (cache) => {
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
      if (cache.message)
        embed.description = `There's a message attached that says, "${
          cache.message.emoji + ' ' + cache.message.message
        }"`

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

    // interactablePlanets.forEach(async (otherGuild) => {
    //   const positionAndAngle = positionAndAngleDifference(
    //     ...guild.ship.location,
    //     ...otherGuild.ship.location,
    //   )
    //   const embed = new Discord.MessageEmbed()
    //     .setColor(process.env.APP_COLOR)
    //     .setTitle(otherGuild.ship.name)
    //     .setDescription(
    //       `${positionAndAngle.distance.toFixed(
    //         2,
    //       )} AU away from you at an angle of ${Math.round(
    //         positionAndAngle.angle,
    //       )} degrees.`,
    //     )

    //   const availableActions = guild.ship.getActionsOnOtherShip(otherGuild.ship)

    //   const sentMessages = await send(msg, embed)
    //   const sentMessage = sentMessages[sentMessages.length - 1]
    //   await awaitReaction({
    //     msg: sentMessage,
    //     reactions: availableActions,
    //     actionProps: { otherShip: otherGuild.ship },
    //     embed,
    //     guild,
    //   })
    // })

    interactableGuilds.forEach(async (otherGuild) => {
      const positionAndAngle = positionAndAngleDifference(
        ...guild.ship.location,
        ...otherGuild.ship.location,
      )
      const embed = new Discord.MessageEmbed()
        .setColor(process.env.APP_COLOR)
        .setTitle(otherGuild.ship.name)
        .setDescription(
          `${positionAndAngle.distance.toFixed(
            2,
          )} AU away from you at an angle of ${Math.round(
            positionAndAngle.angle,
          )} degrees.`,
        )

      const availableActions = guild.ship.getActionsOnOtherShip(otherGuild.ship)

      const sentMessages = await send(msg, embed)
      const sentMessage = sentMessages[sentMessages.length - 1]
      await awaitReaction({
        msg: sentMessage,
        reactions: availableActions,
        actionProps: { otherShip: otherGuild.ship },
        embed,
        guild,
      })
    })
  },
}
