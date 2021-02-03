const send = require('../actions/send')
const { log, applyCustomParams } = require('../botcommon')
const Discord = require('discord.js')
const runTypingTest = require('../actions/runTypingTest')
const textOptions = require('../defaults/typingTestOptions')

module.exports = {
  tag: 'trainMechanics',
  documentation: { name: `trainmechanics` },
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:trainmechanics|mechanicstraining)$`,
      'gi',
    ).exec(content)
  },
  async action({ msg, author, ship, authorCrewMemberObject }) {
    log(msg, 'Train Mechanics', msg.guild.name)

    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`${author.nickname} | Mechanics Training`)
      .setDescription(`Type as many sentences as fast as you can within the time limit!
You'll gain XP for speed and accuracy.
Capitalization doesn't matter, but copy-and-pasting won't work.
Your crewmates can help too, if they want to.`)

    const lastMessage = (await send(msg, embed))[0]

    const challengeCount = 5

    //  this whole promise is extractable into a common function
    const { hits, sentTextOptions, time } = await runTypingTest({
      challengeCount,
      textOptions,
      embed,
      msg,
      lastMessage,
      ship,
    })

    const xp = Math.round(hits * 1000)

    const res = authorCrewMemberObject.addXp('mechanics', xp)

    embed.setDescription(
      `**${challengeCount} challenges in ${(time / 1000).toFixed(1)} seconds**
${sentTextOptions
  .map(
    (o) =>
      (o.bestScore === 0
        ? '❌'
        : o.bestScore > 0.99
        ? '✅'
        : o.bestScore > 0.5
        ? '👍'
        : '👎') +
      ` "${o.target.toLowerCase()}" - ${(o.bestScore * 100).toFixed(0)}%${
        o.bestAttemptText && o.bestScore < 0.99
          ? ` ("${o.bestAttemptText.toLowerCase()}")`
          : ''
      }`,
  )
  .join('\n')}

Result: ${await applyCustomParams(msg, res.message)}`,
    )
    lastMessage.edit(embed)
  },
}
