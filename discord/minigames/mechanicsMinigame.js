const send = require('../actions/send')
const lunicode = require('Lunicode')
const Fuse = require('fuse.js')
const Discord = require('discord.js-light')
const textOptions = require('../defaults/typingTestOptions')
const { applyCustomParams } = require('../botcommon')
const { allSkills } = require('../../game/gamecommon')
const readyCheck = require('../actions/readyCheck')

module.exports = ({ msg, user, guild }) => {
  return new Promise(async (resolve) => {
    const emoji = allSkills.find((s) => s.name === 'mechanics').emoji

    // ------- generate general game variables
    const userLevel = user.level.mechanics || 0
    const challengeCount = 4
    const timePerCharacter = 150 - userLevel * 3

    const averageCharacters =
      textOptions.reduce((total, curr) => total + curr.length, 0) /
      textOptions.length
    const gracePeriod = 2000
    const time = Math.floor(
      challengeCount * timePerCharacter * averageCharacters
    )

    let fuse
    const sentTextOptions = []
    const messagesToDelete = []

    // ------- make game embed
    const embed = new Discord.MessageEmbed()
      .setColor(APP_COLOR)
      .setTitle(`${emoji} Mechanics Training | ${msg.author.nickname}`)
      .setDescription(`When it comes to mechanics, speed and accuracy are paramount, as is teamwork. This training regimen has been specifically designed to boost your capabilities in all of the above.

Type as many sentences as fast as you can within the time limit!
One line per message.
Capitalization doesn't matter, but copy-and-pasting won't work.
Your crewmates can help out.`)

    embed.description += `\n\n**You have ${(time / 1000).toFixed(0)} seconds.**`

    // ------- wait for them to say I'm Ready
    const sentMessage = (await send(msg, embed))[0]
    await readyCheck({ msg: sentMessage, embed, user })

    // ------- get challenge text to use
    const challengeTextInOneArray = []
    for (let i = 0; i < challengeCount; i++) {
      if (!textOptions.length) continue
      const textIndex = Math.floor(Math.random() * textOptions.length)
      const textToSend = textOptions[textIndex]
      textOptions.splice(textIndex, 1)
      challengeTextInOneArray.push(
        '→ ' + lunicode.tools.tiny.encode(textToSend)
      )
      sentTextOptions.push({
        target: textToSend.toLowerCase(),
        bestScore: 0
      })
    }

    embed.description +=
      '\n\n**↓↓↓ Type these sentences! ↓↓↓**\n' +
      challengeTextInOneArray.join('\n')
    await sentMessage.edit(embed)

    // ------- define fuzzy search
    fuse = new Fuse(sentTextOptions, {
      includeScore: true,
      keys: ['target'],
      threshold: 1, // 1 is anything
      minMatchCharLength: 8
    })

    // ------- define message collect action
    const onMessageCollect = (receivedMessage) => {
      const sender = receivedMessage.author
      if (sender.bot) return

      const member = guild.ship.members.find((m) => m.id === sender.id)
      if (!member) return

      const content = receivedMessage.content

      const target = fuse.search(content)[0].item.target
      const hitOption = sentTextOptions.find((o) => o.target === target)
      const score = 1 - fuse.search(content)[0].score
      if (hitOption && score > 0.35) {
        if (hitOption.bestScore < score) {
          hitOption.bestScore = score
          hitOption.bestAttemptText = content
        }
        messagesToDelete.push(receivedMessage)
        try {
          receivedMessage.react('👀')
        } catch (e) {}
      }
    }

    // ------- watch for messages
    const collector = new Discord.MessageCollector(
      msg.channel,
      onMessageCollect,
      {
        time: time + gracePeriod
      }
    )

    setTimeout(async () => {
      messagesToDelete.push((await send(msg, 'Time\'s up!'))[0])
    }, time)

    // ------- end of game
    setTimeout(async () => {
      setTimeout(() => {
        [...messagesToDelete].forEach((c) => {
          if (!c.deleted) c.delete()
        })
      }, 500)
      collector.stop()

      const hits = sentTextOptions.reduce(
        (total, option) => total + option.bestScore,
        0
      )

      // ------- calculate and add XP
      const xp = Math.round(hits * 1000)
      const res = user.addXp('mechanics', xp)

      // ------- update embed with results
      embed.description = `**${challengeCount} challenges in ${(
        time / 1000
      ).toFixed(1)} seconds**
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
          }`
      )
      .join('\n')}

Result: ${await applyCustomParams(msg, res.message)}`

      sentMessage.edit(embed)
    }, time + gracePeriod)
  })
}
