const send = require('../actions/send')
const { log, applyCustomParams } = require('../botcommon')
const Discord = require('discord.js')
const runTypingTest = require('../actions/runTypingTest')
const textOptions = require('../defaults/typingTestOptions')

module.exports = {
  tag: 'trainMunitions',
  documentation: false,
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:trainmunitions?|munitions?training)$`,
      'gi',
    ).exec(content)
  },
  async action({ msg, author, ship, authorCrewMemberObject }) {
    log(msg, 'Train Munitions', msg.guild.name)

    // ---------- use stamina
    const member =
      authorCrewMemberObject ||
      guild.ship.members.find((m) => m.id === msg.author.id)
    if (!member) return console.log('no user found in trainMunitions')
    const staminaRes = member.useStamina('train')
    if (!staminaRes.ok) return send(msg, staminaRes.message)

    // const embed = new Discord.MessageEmbed()
    //   .setColor(process.env.APP_COLOR)
    //   .setTitle(`${author.nickname} | Munitions Training`)
    //   .setDescription(``)

    // const sentMessage = (await send(msg, embed))[0]

    // const challengeCount = 5

    // const { hits, sentTextOptions, time } = await runTypingTest({
    //   challengeCount,
    //   textOptions,
    //   embed,
    //   msg,
    //   sentMessage,
    //   ship,
    // })

    const xp = Math.round(1 * 1000)

    const res = authorCrewMemberObject.addXp('munitions', xp)
    return send(msg, `${xp} munitions xp added (no game here yet)`)

    //     embed.setDescription(
    //       `**${challengeCount} challenges in ${(time / 1000).toFixed(1)} seconds**
    // ${sentTextOptions
    //   .map(
    //     (o) =>
    //       (o.bestScore === 0
    //         ? '❌'
    //         : o.bestScore > 0.99
    //         ? '✅'
    //         : o.bestScore > 0.5
    //         ? '👍'
    //         : '👎') +
    //       ` "${o.target.toLowerCase()}" - ${(o.bestScore * 100).toFixed(0)}%${
    //         o.bestAttemptText && o.bestScore < 0.99
    //           ? ` ("${o.bestAttemptText.toLowerCase()}")`
    //           : ''
    //       }`,
    //   )
    //   .join('\n')}

    // Result: ${await applyCustomParams(msg, res.message)}`,
    //     )
    //     sentMessage.edit(embed)
  },
}
