const send = require('../actions/send')
const { log } = require('../botcommon')
const awaitReaction = require('../actions/awaitReaction')
const Discord = require('discord.js')

const voteTime = process.env.DEV ? 20 * 1000 : process.env.GENERAL_VOTE_TIME

module.exports = {
  tag: 'direction',
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:direction)$`, 'gi').exec(content)
  },
  async action({ msg, settings, game, client, ship }) {
    log(msg, 'Direction Vote', msg.guild.name)

    // const timeUntilNextTick = client.game.timeUntilNextTick()

    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`Direction Vote Called`)
      .setDescription(
        `Pilots of level 2 and above can vote on the ship's bearing. The final direction will be an average of the crew's vote.`,
      )
      .addFields({
        name: 'Remaining vote time:',
        value: (voteTime / 60 / 1000).toFixed(2) + 'minutes',
      })

    const startTime = Date.now()
    let remainingTime = voteTime
    let done = false

    const sentMessages = await send(msg, embed)
    const lastMessage = sentMessages[sentMessages.length - 1]

    const embedUpdateInterval = setInterval(() => {
      if (done === true) return clearInterval(embedUpdateInterval)
      remainingTime = startTime + voteTime - Date.now()
      if (remainingTime < 0) remainingTime = 0
      embed.fields = {
        name: 'Remaining vote time:',
        value: (remainingTime / 60 / 1000).toFixed(2) + 'minutes',
      }

      if (remainingTime <= 0) {
        clearInterval(embedUpdateInterval)
        done = true
      }
      lastMessage.edit(embed)
    }, 5000)

    const availableDirections = ship.getAvailableDirections()

    const reactions = await awaitReaction({
      msg: lastMessage,
      reactions: availableDirections,
      embed,
      time: voteTime,
      listeningType: 'votes',
    })
    done = true

    const toAggregate = reactions.map((r) => {
      const direction = availableDirections.find(
        (d) => d.emoji === r.emoji.name,
      )
      return {
        vector: direction.vector,
        weight: 1,
      }
    })
    const res = ship.redirect(toAggregate)

    embed.fields = {
      name: 'Vote Complete!',
      value: res.ok
        ? `Result: ${res.arrow} ${res.degrees} degrees`
        : `Result: Stay the course`,
    }
    lastMessage.edit(embed)

    // vote from all qualified pilots on the direction of the server (8 options)
    // average of choices, weighted by role & pilot level
    // closed right before new server tick
  },
}
