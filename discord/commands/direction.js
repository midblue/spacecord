const send = require('../actions/send')
const { log, username } = require('../botcommon')
const { capitalize } = require('../../common')
const runPoll = require('../actions/runPoll')
const Discord = require('discord.js-light')

const voteTime = process.env.DEV ? 10 * 1000 : process.env.GENERAL_VOTE_TIME

module.exports = {
  tag: 'direction',
  equipmentType: 'telemetry',
  documentation: {
    value: `Starts a vote to steer the ship in any direction.`,
    emoji: '🧭',
    category: 'ship',
    priority: 75,
  },
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:dir|direction|steer|turn|rotate)$`,
      'gi',
    ).exec(content)
  },
  async action({ msg, author, guild, ship, requirements }) {
    log(msg, 'Direction Vote', msg.guild.name)

    // ---------- use stamina
    const authorCrewMemberObject = guild.ship.members.find(
      (m) => m.id === msg.author.id,
    )
    if (!authorCrewMemberObject)
      return console.log('no user found in direction')
    const staminaRes = authorCrewMemberObject.useStamina('poll')
    if (!staminaRes.ok) return send(msg, staminaRes.message)

    const availableDirections = ship.getAvailableDirections()

    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`Direction Vote Called by ${author.nickname}`)
      .setDescription(
        `Crew with at least ${Object.keys(requirements)
          .map((r) => `level \`${requirements[r]}\` in \`${capitalize(r)}\` `)
          .join(
            'and ',
          )}can vote on the ship's bearing. The final direction will be an average of the crew's vote, with votes from users with higher piloting skills carrying more weight.

Current direction is ${ship.getDirectionString()}

Your ship's engine supports \`${
          availableDirections.length
        }\` choices for voting.`,
      )

    const { ok, message, userReactions, sentMessage } = await runPoll({
      pollType: 'direction',
      embed,
      time: voteTime,
      reactions: availableDirections,
      guild,
      msg,
      requirements,
      weightByLevelType: 'piloting',
    })
    if (!ok) return send(msg, message)

    const toAggregate = Object.keys(userReactions).map((emoji) => {
      const direction = availableDirections.find((d) => d.emoji === emoji)
      return {
        vector: direction.vector,
        weight: userReactions[emoji].weightedCount,
      }
    })

    const previousDirection = ship.getDirectionString()
    const res = ship.redirect(toAggregate)

    embed.description = `Previous direction was ${previousDirection}`
    if (!embed.fields || !embed.fields.length) embed.fields = []
    embed.fields.push({
      name: 'Vote Complete!',
      value: res.ok
        ? `Result: Steering to ${ship.getDirectionString()}`
        : `Result: Stay the course`,
    })
    embed.description = embed.description.replace(
      'Current direction is',
      'Previous direction was',
    )

    sentMessage.edit(embed)
  },
}
