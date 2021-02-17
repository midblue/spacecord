const send = require('../actions/send')
const { log, applyCustomParams } = require('../botcommon')
const Discord = require('discord.js')
const lunicode = require('Lunicode')
const Fuse = require('fuse.js')
const runCountingTest = require('../actions/runCountingTest')

module.exports = {
  tag: 'trainEngineering',
  documentation: false,
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:trainengineering|engineeringtraining)$`,
      'gi',
    ).exec(content)
  },
  async action({
    msg,
    author,
    guild,
    ship,
    authorCrewMemberObject,
    staminaRequired,
  }) {
    log(msg, 'Train Engineering', msg.guild.name)

    // ---------- use stamina
    const member =
      authorCrewMemberObject ||
      guild.ship.members.find((m) => m.id === msg.author.id)
    if (!member) return console.log('no user found in trainEng')
    if (!staminaRequired)
      staminaRequired = authorCrewMemberObject.staminaRequiredFor('engineering')
    const staminaRes = member.useStamina('train')
    if (!staminaRes.ok) return send(msg, staminaRes.message)

    const emojiChoices = [
      '🚀',
      '👾',
      '🔭',
      '🪐',
      '☄️',
      '🛸',
      '👽',
      '🛰',
      '1️⃣',
      '0️⃣',
      '💫',
      '🌌',
      '🌠',
      '🤖',
    ]

    const choiceIndex = Math.floor(Math.random() * emojiChoices.length)

    const targetEmoji = emojiChoices[choiceIndex]
    emojiChoices.splice(choiceIndex, 1)

    const embed = new Discord.MessageEmbed()
      .setColor(APP_COLOR)
      .setTitle(`${author.nickname} | Engineering Training`)
      .setDescription(
        `Count the number of \`${targetEmoji}\` in the following mojcode snippet.`,
      )

    const sentMessage = (await send(msg, embed))[0]

    const { rewardXp, guess, correctAnswer } = await runCountingTest({
      embed,
      msg,
      sentMessage,
      targetEmoji,
      emojiChoices,
    })

    if (!guess) return

    const res = authorCrewMemberObject.addXp('engineering', rewardXp)

    embed.setDescription(
      `**You guessed that ${guess} \`${targetEmoji}\` were in the mojcode snippet.
      There were ${correctAnswer}, so you earned ${rewardXp} XP!**
      Result: ${await applyCustomParams(msg, res.message)}`,
    )
    sentMessage.edit(embed)
  },
}
