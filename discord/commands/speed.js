const send = require('../actions/send')
const { log } = require('../botcommon')
const awaitReaction = require('../actions/awaitReaction')
const Discord = require('discord.js')

const voteTime = process.env.DEV ? 20 * 1000 : process.env.GENERAL_VOTE_TIME

module.exports = {
  tag: 'speed',
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:speed)$`, 'gi').exec(content)
  },
  async action({ msg, settings, game, client, ship }) {
    log(msg, 'Speed Vote', msg.guild.name)

    // const timeUntilNextTick = client.game.timeUntilNextTick()

    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`Speed Vote Called`)
      .setDescription(
        `Pilots of level 2 and above can vote on the ship's thrust. The final will be an average of the crew's vote multiplied by your engines' maximum power.`,
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

    const availableSpeedLevels = ship.getAvailableSpeedLevels()

    const reactions = await awaitReaction({
      msg: lastMessage,
      reactions: availableSpeedLevels,
      embed,
      time: voteTime,
      listeningType: 'votes',
    })
    done = true

    const toAggregate = reactions.map((r) => {
      const direction = availableSpeedLevels.find(
        (d) => d.emoji === r.emoji.name,
      )
      return {
        speed: direction.speed,
        weight: 1,
      }
    })
    const res = ship.redetermineSpeed(toAggregate)

    embed.fields = {
      name: 'Vote Complete!',
      value: res.ok
        ? `Result: ${res.voteResult.toFixed(1)}, ${(
            res.voteResult * 10
          ).toFixed(0)}% of your engine's power. Final speed is ${
            res.newSpeed
          } out of ${res.maxSpeed} maximum.`
        : `Result: Maintain speed`,
    }
    lastMessage.edit(embed)

    // vote from all qualified pilots on the direction of the server (8 options)
    // average of choices, weighted by role & pilot level
    // closed right before new server tick
  },
}
