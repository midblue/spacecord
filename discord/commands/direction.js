const send = require('../actions/send')
const { log, username } = require('../botcommon')
const { capitalize } = require('../../common')
const runPoll = require('../actions/runPoll')
const Discord = require('discord.js')

const voteTime = process.env.DEV ? 10 * 1000 : process.env.GENERAL_VOTE_TIME

module.exports = {
  tag: 'direction',
  equipmentType: 'telemetry',
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:direction|steer|turn|rotate)$`,
      'gi',
    ).exec(content)
  },
  async action({ msg, settings, game, client, ship, requirements }) {
    log(msg, 'Direction Vote', msg.guild.name)

    const availableDirections = ship.getAvailableDirections()
    const authorName = await username(msg.author)

    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`Direction Vote Called by ${authorName}`)
      .setDescription(
        `Crew with at least ${Object.keys(requirements)
          .map((r) => `level \`${requirements[r]}\` in \`${capitalize(r)}\` `)
          .join(
            'and ',
          )}can vote on the ship's bearing. The final direction will be an average of the crew's vote.
					
Current direction is \`${ship.getDirectionString()}\`

Your ship's engine supports \`${
          availableDirections.length
        }\` choices for voting.`,
      )

    const { userReactions, lastMessage } = await runPoll({
      embed,
      time: voteTime,
      reactions: availableDirections,
      ship,
      msg,
      requirements,
    })

    const toAggregate = Object.keys(userReactions).map((emoji) => {
      const direction = availableDirections.find((d) => d.emoji === emoji)
      return {
        vector: direction.vector,
        weight: userReactions[emoji].weightedCount,
      }
    })
    const res = ship.redirect(toAggregate)

    if (embed.fields && embed.fields.length) embed.fields.pop()
    else embed.fields = []
    embed.fields.push({
      name: 'Vote Complete!',
      value: res.ok
        ? `Result: Steering to \`${res.arrow} ${res.degrees} degrees\``
        : `Result: Stay the course`,
    })

    lastMessage.edit(embed)
  },
}
