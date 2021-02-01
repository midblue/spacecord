const { log, username } = require('../botcommon')
const { capitalize } = require('../../common')
const Discord = require('discord.js')
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

    const maxSpeed = ship.maxSpeed()
    const availableSpeedLevels = ship.getAvailableSpeedLevels()

    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`Speed Vote Called by ${author.nickname}`)
      .setDescription(
        `Crew with at least ${Object.keys(requirements)
          .map((r) => `level \`${requirements[r]}\` in \`${capitalize(r)}\` `)
          .join(
            'and ',
          )}can vote from 0 to 10 on the ship's thrust, with 0 being stopped and 10 being full speed. The final will be an average of the crew's vote multiplied by your engines' cumulative maximum speed.
					
Current speed is \`${ship.speed} ${process.env.SPEED_UNIT}\`, which is \`${(
          (ship.speed / maxSpeed) *
          100
        ).toFixed(0)}%\` of your ship's maximum.
				
Your ship's engine supports \`${
          availableSpeedLevels.length
        }\` choices for voting.`,
      )

    const { userReactions, lastMessage } = await runPoll({
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

    embed.fields = {
      name: 'Vote Complete!',
      value: res.ok
        ? `Result: \`${res.voteResult.toFixed(1)}\`, or \`${(
            res.voteResult * 10
          ).toFixed(0)}%\` of your engine's power.
Final speed is \`${res.newSpeed} ${
            process.env.SPEED_UNIT
          }\` out of a maximum of \`${maxSpeed}\`.`
        : `Result: Maintain speed`,
    }

    lastMessage.edit(embed)
  },
}
