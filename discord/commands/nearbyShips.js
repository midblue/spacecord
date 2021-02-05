const send = require('../actions/send')
const { log } = require('../botcommon')
const { numberToEmoji, capitalize } = require('../../common')
const awaitReaction = require('../actions/awaitReaction')
const Discord = require('discord.js')
const story = require('../../game/basics/story/story')
const trainingActions = {
  engineering: require('./trainEngineering').action,
  mechanics: require('./trainMechanics').action,
}

module.exports = {
  tag: 'nearbyShips',
  documentation: {
    name: 'nearbyships',
    value: `Inspect and interact with nearby ships.`,
    emoji: '🛸',
    priority: 60,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:nearbyships?|nearby)$`, 'gi').exec(
      content,
    )
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
        range: guild.ship.interactRadius || process.env.INTERACT_RADIUS,
        excludeIds: guild.guildId,
      }).guilds

    if (interactableGuilds.length === 0)
      return send(msg, story.interact.noShips())

    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`Nearby Ships`)

    embed.fields.push(
      interactableGuilds.map((g) => {
        let valueString = g.ship.members.length
        return {
          name: g.ship.name,
          value: valueString,
        }
      }),
    )

    const actions = []
    if (interactableGuilds.length > 1) {
    }

    const sentMessages = await send(msg, embed)
    // const sentMessage = sentMessages[sentMessages.length - 1]
    // await awaitReaction({
    //   msg: sentMessage,
    //   reactions: trainableSkillsAsReactionOptions,
    //   embed,
    //   guild,
    //   listeningType: 'training choice',
    // })
  },
}
