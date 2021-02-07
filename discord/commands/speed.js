const { log, username } = require('../botcommon')
const { capitalize } = require('../../common')
const Discord = require('discord.js-light')
const runPoll = require('../actions/runPoll')

const voteTime = process.env.DEV ? 10 * 1000 : process.env.GENERAL_VOTE_TIME

module.exports = {
  tag: 'speed',
  equipmentType: 'engine',
  documentation: {
    value: `Starts a vote to set the ship's speed.`,
    emoji: '⏩',
    priority: 75,
  },
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:speed|speedup|slowdown|accelerate|decelerate|accel|decel|thrust|go|move|forward)$`,
      'gi',
    ).exec(content)
  },
  async action({ msg, settings, author, game, client, ship, requirements }) {
    log(msg, 'Speed Vote', msg.guild.name)

    const effectiveSpeed = ship.effectiveSpeed()
    const maxSpeed = ship.maxSpeed()
    const availableSpeedLevels = ship.getAvailableSpeedLevels()

    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`Speed Vote Called by ${author.nickname}`)
      .setDescription(
        `Crew can vote from 0 to 10 on the ship's thrust, with 0 being stopped and 10 being full speed. The final will be an average of the crew's vote multiplied by your engines' cumulative maximum speed, affected by how much weight you're carrying.
					
Current speed is \`${effectiveSpeed.toFixed(3)} ${
          process.env.SPEED_UNIT
        }\`, which is \`${((effectiveSpeed / maxSpeed) * 100).toFixed(
          0,
        )}%\` of your ship's current maximum.
				
				Ship, equipment, and cargo weight totals \`${Math.round(
          ship.getTotalWeight(),
        )} ${
          process.env.WEIGHT_UNIT_PLURAL
        }\` out of your ship's maximum capacity of \`${Math.round(
          ship.maxWeight,
        )} ${process.env.WEIGHT_UNIT_PLURAL}\`.
				
Your ship's engine supports \`${
          availableSpeedLevels.length
        }\` choices for voting.`,
      )

    const { userReactions, sentMessage } = await runPoll({
      embed,
      time: voteTime,
      reactions: availableSpeedLevels,
      ship,
      msg,
      requirements,
    })

    const toAggregate = Object.keys(userReactions).map((emoji) => {
      const direction = availableSpeedLevels.find((d) => d.emoji === emoji)
      return {
        speed: direction.speed,
        weight: userReactions[emoji].weightedCount,
      }
    })

    const res = ship.redetermineSpeed(toAggregate)

    embed.description = embed.description.replace(
      'Current speed is',
      'Previous speed was',
    )
    embed.fields = {
      name: 'Vote Complete!',
      value: res.ok
        ? `Result: \`${res.voteResult.toFixed(3)}\`, or \`${(
            res.voteResult * 10
          ).toFixed(0)}%\` of your engine's power.
Final speed is \`${ship.effectiveSpeed().toFixed(3)} ${
            process.env.SPEED_UNIT
          }\` out of a maximum of \`${maxSpeed.toFixed(3)} ${
            process.env.SPEED_UNIT
          }\`.`
        : `Result: Maintain speed` +
          (ship.status.stranded
            ? `\n\nHowever, your ship is out of fuel, so it won't be going at any speed.`
            : ''),
    }

    sentMessage.edit(embed)
  },
}
