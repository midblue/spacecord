const send = require('./send')
const lunicode = require('Lunicode')
const Fuse = require('fuse.js')
const Discord = require('discord.js-light')

module.exports = ({
  msg,
  challengeCount = 5,
  timePerCharacter = 160,
  sentMessage,
  textOptions,
  embed,
  ship,
}) => {
  return new Promise(async (resolve) => {
    const averageCharacters =
      textOptions.reduce((total, curr) => total + curr.length, 0) /
      textOptions.length
    const gracePeriod = 2000
    const time = Math.floor(
      challengeCount * timePerCharacter * averageCharacters,
    )

    let fuse
    const sentTextOptions = []
    const messagesToDelete = []

    if (embed) {
      embed.description += `\n\n**You have ${(time / 1000).toFixed(
        0,
      )} seconds.**`
      sentMessage.edit(embed)
    } else send(msg, `**You have ${(time / 1000).toFixed(0)} seconds.**`)

    let challengeTextInOneArray = []
    for (let i = 0; i < challengeCount; i++) {
      if (!textOptions.length) continue
      const textIndex = Math.floor(Math.random() * textOptions.length)
      const textToSend = textOptions[textIndex]
      textOptions.splice(textIndex, 1)
      challengeTextInOneArray.push(lunicode.tools.tiny.encode(textToSend))
      sentTextOptions.push({
        target: textToSend.toLowerCase(),
        bestScore: 0,
      })
    }

    messagesToDelete.push(
      (await send(msg, challengeTextInOneArray.join('\n')))[0],
    )
    fuse = new Fuse(sentTextOptions, {
      includeScore: true,
      keys: ['target'],
      threshold: 1, // 1 is anything
    })

    setTimeout(async () => {
      messagesToDelete.push((await send(msg, `Time's up!`))[0])
    }, time)

    const filter = (receivedMessage) => {
      const sender = receivedMessage.author
      if (sender.bot) return

      const member = ship.members.find((m) => m.id === sender.id)
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

    const collector = new Discord.MessageCollector(msg.channel, filter, {
      time: time + gracePeriod,
    })

    setTimeout(() => {
      setTimeout(() => {
        ;[...messagesToDelete].forEach((c) => c.delete())
      }, 500)
      collector.stop()

      const hits = sentTextOptions.reduce(
        (total, option) => total + option.bestScore,
        0,
      )
      resolve({ hits, sentTextOptions, time, challengeCount })
    }, time + gracePeriod)
  })
}
