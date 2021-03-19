const send = require(`../actions/send`)
const { log } = require(`../botcommon`)
const {
  numberToEmoji,
  capitalize,
  positionAndAngleDifference,
  degreesToArrow,
  usageTag,
} = require(`../../common`)
const awaitReaction = require(`../actions/awaitReaction`)
const runGuildCommand = require(`../actions/runGuildCommand`)
const Discord = require(`discord.js-light`)
const story = require(`../../game/basics/story/story`)
const getCache = require(`../actions/getCache`)
const land = require(`../actions/land`)

module.exports = {
  tag: `nearby`,
  pmOnly: true,
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
  async action({
    msg,
    guild,
    interactableGuilds,
    filter,
    authorCrewMemberObject,
  }) {
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
              excludeIds: guild.id,
            }).guilds
          : []
    }

    const interactableCaches =
      !filter || filter === `caches`
        ? guild.context.scanArea({
            x: guild.ship.location[0],
            y: guild.ship.location[1],
            range: guild.ship.tractorRadius(),
            excludeIds: guild.id,
          }).caches
        : []

    const interactablePlanets =
      !filter || filter === `planets`
        ? guild.context.scanArea({
            x: guild.ship.location[0],
            y: guild.ship.location[1],
            range: guild.ship.interactRadius(),
            excludeIds: guild.id,
          }).planets
        : []

    if (
      interactableGuilds.length +
        interactableCaches.length +
        interactablePlanets.length ===
      0
    ) {
      return authorCrewMemberObject.message(story.interact.nothing())
    }

    if (interactableCaches.length) {
      const cacheEmbed = new Discord.MessageEmbed()
        .setColor(APP_COLOR)
        .setTitle(`📦 Caches`)

      const availableActions = []
      interactableCaches.forEach(async (cache, index) => {
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
      })
      authorCrewMemberObject.message(cacheEmbed, {
        reactions: availableActions,
        commandsLabel: `Grab which cache?`,
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
          `A ${planet.getSizeDescriptor()} ${planet.color} planet ${
            Math.round(positionAndAngle.distance * 1000) / 1000
          } AU away from you at an angle of ${degreesToArrow(
            positionAndAngle.angle,
          )}${Math.round(positionAndAngle.angle)} degrees.`,
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

      authorCrewMemberObject.message(embed, availableActions)
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

      authorCrewMemberObject.message(embed, {
        reactions: availableActions,
        actionProps: { otherShip: otherGuild.ship },
      })
    })
  },
}
