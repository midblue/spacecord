const send = require(`../actions/send`)
const { log } = require(`../botcommon`)
const {
  numberToEmoji,
  capitalize,
  positionAndAngleDifference,
  usageTag,
} = require(`../../common`)
const awaitReaction = require(`../actions/awaitReaction`)
const runGuildCommand = require(`../actions/runGuildCommand`)
const Discord = require(`discord.js-light`)
const story = require(`../../game/basics/story/story`)
const { interact } = require(`../../game/basics/story/story`)
const getCache = require(`../actions/getCache`)
const land = require(`../actions/land`)

module.exports = {
  tag: `nearby`,
  documentation: {
    name: `nearby`,
    value: `Inspect and interact with nearby ships, planets, etc.`,
    emoji: `👉`,
    category: `interaction`,
    priority: 80,
  },
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:nearbyships?|nearby|near)$`,
      `gi`,
    ).exec(content)
  },
  async action({ msg, guild, interactableGuilds, filter }) {
    log(msg, `Nearby`, filter || `No Filter`)

    if (guild.ship.status.docked) {
      return runGuildCommand({ msg, commandTag: `planet` })
    }

    if (filter && filter !== `guilds`) interactableGuilds = []
    if (interactableGuilds === undefined) {
      interactableGuilds =
        !filter || filter === `guilds`
          ? guild.context.scanArea({
              x: guild.ship.location[0],
              y: guild.ship.location[1],
              range: guild.ship.attackRadius(),
              excludeIds: guild.guildId,
            }).guilds
          : []
    }

    const interactableCaches =
      !filter || filter === `caches`
        ? guild.context.scanArea({
            x: guild.ship.location[0],
            y: guild.ship.location[1],
            range: guild.ship.tractorRadius(),
            excludeIds: guild.guildId,
          }).caches
        : []

    const interactablePlanets =
      !filter || filter === `planets`
        ? guild.context.scanArea({
            x: guild.ship.location[0],
            y: guild.ship.location[1],
            range: guild.ship.interactRadius(),
            excludeIds: guild.guildId,
          }).planets
        : []

    if (
      interactableGuilds.length +
        interactableCaches.length +
        interactablePlanets.length ===
      0
    ) {
      return send(msg, story.interact.nothing())
    }

    if (interactableCaches.length) {
      const cacheEmbed = new Discord.MessageEmbed()
        .setColor(APP_COLOR)
        .setTitle(`📦 Caches`)

      const availableActions = []
      interactableCaches.forEach(async (cache, index) => {
        // const positionAndAngle = positionAndAngleDifference(
        //   ...guild.ship.location,
        //   ...cache.location,
        // )
        availableActions.push({
          emoji: numberToEmoji(index + 1),
          label:
            cache.amount.toFixed(2) +
            (cache.type === `credits` ? `` : ` ` + WEIGHT_UNITS + ` of`) +
            ` ` +
            cache.emoji +
            cache.displayName,
          action: ({ msg, guild }) => {
            getCache({
              cache,
              msg,
              guild,
            })
          },
        })
        // const embed = new Discord.MessageEmbed()
        //   .setColor(APP_COLOR)
        //   .setTitle(
        //     '📦 Cache: ' +
        //       cache.amount.toFixed(2) +
        //       (cache.type === 'credits'
        //         ? ''
        //         : ' ' + WEIGHT_UNITS + ' of') +
        //       ' ' +
        //       cache.emoji +
        //       cache.displayName,
        //   )
        //   .setDescription(
        //     `${positionAndAngle.distance.toFixed(
        //       2,
        //     )} AU away from you at an angle of ${Math.round(
        //       positionAndAngle.angle,
        //     )} degrees.`,
        //   )

        // const availableActions = [
        //   {
        //     emoji: '✋',
        //     label: 'Grab the cache! ' + usageTag(0, 'cache'),
        //     async action({ user, msg, guild }) {
        //       getCache({
        //         cache,
        //         msg,
        //         guild,
        //       })
        //     },
        //   },
        // ]
      })
      const sentMessage = (await send(msg, cacheEmbed))[0]
      awaitReaction({
        commandsLabel: `Grab which cache?`,
        msg: sentMessage,
        reactions: availableActions,
        embed: cacheEmbed,
        guild,
      })
    }

    interactablePlanets.forEach(async (planet) => {
      const positionAndAngle = positionAndAngleDifference(
        ...guild.ship.location,
        ...planet.location,
      )
      const embed = new Discord.MessageEmbed()
        .setColor(APP_COLOR)
        .setTitle(`🪐 ` + planet.name)
        .setDescription(
          `A ${planet.getSizeDescriptor()} ${
            planet.color
          } planet ${positionAndAngle.distance.toFixed(
            2,
          )} AU away from you at an angle of ${Math.round(
            positionAndAngle.angle,
          )} degrees.`,
        )

      const availableActions = [
        {
          emoji: `🛬`,
          label: `Vote to land on ` + planet.name + ` ` + usageTag(0, `land`),
          action: ({ user, msg }) => {
            land({ msg, user, planet, guild })
          },
        },
      ]

      const sentMessages = await send(msg, embed)
      const sentMessage = sentMessages[sentMessages.length - 1]
      await awaitReaction({
        msg: sentMessage,
        reactions: availableActions,
        embed,
        guild,
      })
    })

    interactableGuilds.forEach(async (otherGuild) => {
      const positionAndAngle = positionAndAngleDifference(
        ...guild.ship.location,
        ...otherGuild.ship.location,
      )
      const embed = new Discord.MessageEmbed()
        .setColor(APP_COLOR)
        .setTitle(`🛸 ` + otherGuild.ship.name)
        .setDescription(
          otherGuild.ship.status.docked
            ? `Docked on ${otherGuild.ship.status.docked}.`
            : `${positionAndAngle.distance.toFixed(
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
