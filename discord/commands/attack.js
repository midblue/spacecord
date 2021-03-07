const send = require(`../actions/send`)
const { log } = require(`../botcommon`)
const {
  numberToEmoji,
  msToTimeString,
  capitalize,
  positionAndAngleDifference,
} = require(`../../common`)
const awaitReaction = require(`../actions/awaitReaction`)
const Discord = require(`discord.js-light`)
const story = require(`../../game/basics/story/story`)

module.exports = {
  tag: `attack`,
  documentation: {
    name: `attack`,
    value: `Choose a nearby ship to attack.`,
    emoji: `⚔️`,
    category: `interaction`,
    priority: 50,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:att?ack?|a)$`, `gi`).exec(content)
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
    log(msg, `Attack`, msg.guild.name)

    if (
      !guild.ship.equipment.find((e) => e.equipmentType === `weapon`)?.list
        .length
    ) {
      return send(msg, story.attack.noWeapon())
    }
    if (!guild.ship.canAttack()) {
      return send(
        msg,
        story.attack.tooSoon(msToTimeString(guild.ship.nextAttackInMs())),
      )
    }

    if (interactableGuilds === undefined) {
      interactableGuilds = guild.context.scanArea({
        x: guild.ship.location[0],
        y: guild.ship.location[1],
        range: guild.ship.attackRadius(),
        excludeIds: guild.id,
      }).guilds
    }

    const embed = new Discord.MessageEmbed()
      .setColor(APP_COLOR)
      .setTitle(`Which ship would you like to attack?`)

    const actions = []

    interactableGuilds.forEach(async (otherGuild, index) => {
      const positionAndAngle = positionAndAngleDifference(
        ...guild.ship.location,
        ...otherGuild.ship.location,
      )
      const availableActions = guild.ship.getActionsOnOtherShip(otherGuild.ship)
      const attackAction = availableActions.find((a) => a.emoji === `⚔️`)
      if (!attackAction) return
      actions.push({
        emoji: numberToEmoji(index + 1),
        label: `${otherGuild.ship.name}: ${positionAndAngle.distance.toFixed(
          2,
        )} AU away at ${Math.round(positionAndAngle.angle)} degrees`,
        action: attackAction.action,
      })
    })

    if (actions.length === 0) return send(msg, story.attack.noShips())

    if (actions.length === 1) {
      return actions[0].action({ user: author, msg, guild })
    }

    const sentMessage = (await send(msg, embed))[0]
    await awaitReaction({
      msg: sentMessage,
      reactions: actions,
      actionProps: {},
      embed,
      guild,
    })
  },
}
