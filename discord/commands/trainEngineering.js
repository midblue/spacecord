const send = require('../actions/send')
const { log, applyCustomParams } = require('../botcommon')
const Discord = require('discord.js')
const lunicode = require('Lunicode')
const Fuse = require('fuse.js')

module.exports = {
  tag: 'trainEngineering',
  documentation: { name: `trainengineering` },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:trainengineering)$`, 'gi').exec(
      content,
    )
  },
  async action({ msg, author, ship, authorCrewMemberObject }) {
    log(msg, 'Train Engineering', msg.guild.name)

    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`${author.nickname} | Engineering Training`)
      .setDescription(`Type as many sentences as fast as you can within the time limit!
You'll gain XP for speed and accuracy.
Capitalization doesn't matter, but copy-and-pasting won't work.
Your crewmates can help too, if they want to.`)

    const lastMessage = (await send(msg, embed))[0]

    let textOptions = [
      `test target`,
      `fun time for training`,
      `oh dang what about this one`,
      `I'm learning away!`,
      `sci-fi stuff here prob`,
      `like isaac asimov`,
      `or ray bradbury`,
      `or liu cixin`,
      `running out of things`,
      `end of an era`,
    ]

    const challengeCount = 5
    const timePerCharacter = 160

    //  this whole promise is extractable into a common function
    const { hits, sentTextOptions, time } = await new Promise(
      async (resolve) => {
        const averageCharacters =
          textOptions.reduce((total, curr) => total + curr.length, 0) /
          textOptions.length
        const gracePeriod = 2000
        const time = Math.floor(
          challengeCount * timePerCharacter * averageCharacters + gracePeriod,
        )

        let fuse
        const sentTextOptions = []
        const messagesToDelete = []

        messagesToDelete.push(
          (await send(msg, `You have ${(time / 1000).toFixed(0)} seconds.`))[0],
        )

        let challengeTextInOneArray = []
        for (let i = 0; i < challengeCount; i++) {
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
        }, time - 1000)

        const filter = (receivedMessage) => {
          const sender = receivedMessage.author
          if (sender.bot) return

          const member = ship.members.find((m) => m.id === sender.id)
          if (!member) return

          const content = receivedMessage.content

          const target = fuse.search(content)[0].item.target
          const hitOption = sentTextOptions.find((o) => o.target === target)
          const score = 1 - fuse.search(content)[0].score
          if (hitOption && score > 0.5 && hitOption.bestScore < score) {
            hitOption.bestScore = score
            hitOption.bestAttemptText = content
            messagesToDelete.push(receivedMessage)
            try {
              receivedMessage.react('👀')
            } catch (e) {}
          }
        }

        const collector = new Discord.MessageCollector(msg.channel, filter, {
          time,
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
          resolve({ hits, sentTextOptions, time })
        }, time)
      },
    )

    const xp = Math.round(hits * 1000)

    const res = ship.addXp(authorCrewMemberObject.id, 'engineering', xp)

    console.log(sentTextOptions)

    embed.setDescription(
      `**${challengeCount} challenges in ${(time / 1000).toFixed(1)} seconds**
${sentTextOptions
  .map(
    (o) =>
      (o.bestScore === 0 ? '❌' : o.bestScore > 0.99 ? '✅' : '👍') +
      `"${o.target.toLowerCase()}" - ${(o.bestScore * 100).toFixed(0)}%${
        o.bestAttemptText && o.bestScore !== 1
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
