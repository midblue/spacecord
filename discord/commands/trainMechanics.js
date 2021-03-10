const send = require(`../actions/send`)
const { log, canEdit } = require(`../botcommon`)
const lunicode = require(`Lunicode`)
const Fuse = require(`fuse.js`)
const Discord = require(`discord.js-light`)
const { applyCustomParams } = require(`../botcommon`)
const { allSkills } = require(`../../game/gamecommon`)
const readyCheck = require(`../actions/readyCheck`)
// list of optins at the bottom of this file

module.exports = {
  tag: `trainMechanics`,
  pm: true,
  documentation: false,
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:trainmechanics?|mechanics?training)$`,
      `gi`,
    ).exec(content)
  },
  async action({ msg, guild, authorCrewMemberObject, staminaRequired }) {
    log(msg, `Train Mechanics`, msg.guild?.name)

    // ---------- use stamina
    const member =
      authorCrewMemberObject ||
      guild.ship.members.find((m) => m.id === msg.author.id)
    if (!member) return console.log(`no user found in trainMech`)
    if (!staminaRequired) {
      staminaRequired = authorCrewMemberObject.staminaRequiredFor(`mechanics`)
    }
    const staminaRes = member.useStamina(staminaRequired)
    if (!staminaRes.ok) return send(msg, staminaRes.message)

    const emoji = allSkills.find((s) => s.name === `mechanics`).emoji

    // ------- generate general game variables
    const userLevel = authorCrewMemberObject.level.mechanics || 0
    const challengeCount = 4
    const timePerCharacter = 150 - userLevel * 3

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

    // ------- make game embed
    const embed = new Discord.MessageEmbed()
      .setColor(APP_COLOR)
      .setTitle(`${emoji} Mechanics Training | ${msg.author.nickname}`)
      .setDescription(`When it comes to mechanics, speed and accuracy are paramount, as is teamwork. This training regimen has been specifically designed to boost your capabilities in all of the above.
    
    Type as many sentences as fast as you can within the time limit!
    One line per message.
    Capitalization doesn't matter, but copy-and-pasting won't work.`)

    embed.description += `\n\n**You have ${(time / 1000).toFixed(0)} seconds.**`

    // ------- wait for them to say I'm Ready
    const sentMessage = (await send(msg, embed))[0]
    await readyCheck({ msg: sentMessage, embed, user: authorCrewMemberObject })

    // ------- get challenge text to use
    const challengeTextInOneArray = []
    for (let i = 0; i < challengeCount; i++) {
      if (!textOptions.length) continue
      const textIndex = Math.floor(Math.random() * textOptions.length)
      const textToSend = textOptions[textIndex]
      textOptions.splice(textIndex, 1)
      challengeTextInOneArray.push(
        `→ ` + lunicode.tools.tiny.encode(textToSend),
      )
      sentTextOptions.push({
        target: textToSend.toLowerCase(),
        bestScore: 0,
      })
    }

    embed.description +=
      `\n\n**↓↓↓ Type these sentences! ↓↓↓**\n` +
      challengeTextInOneArray.join(`\n`)
    await sentMessage.edit(embed)

    // ------- define fuzzy search
    fuse = new Fuse(sentTextOptions, {
      includeScore: true,
      keys: [`target`],
      threshold: 1, // 1 is anything
      minMatchCharLength: 8,
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
          receivedMessage.react(`👀`)
        } catch (e) {}
      }
    }

    // ------- watch for messages
    const collector = new Discord.MessageCollector(
      msg.channel,
      onMessageCollect,
      { time: time + gracePeriod },
    )

    setTimeout(async () => {
      messagesToDelete.push((await send(msg, `Time's up!`))[0])
    }, time)

    // ------- end of game
    setTimeout(async () => {
      setTimeout(() => {
        messagesToDelete.forEach(async (c) => {
          if (await canEdit(c)) c.delete()
        })
      }, 500)
      collector.stop()

      const hits = sentTextOptions.reduce(
        (total, option) => total + option.bestScore,
        0,
      )

      // ------- calculate and add XP
      const res = authorCrewMemberObject.train(
        `mechanics`,
        hits / challengeCount,
      )

      // ------- update embed with results
      embed.description = `**${challengeCount} challenges in ${(
        time / 1000
      ).toFixed(1)} seconds**
        ${sentTextOptions
          .map(
            (o) =>
              (o.bestScore === 0
                ? `❌`
                : o.bestScore > 0.99
                ? `✅`
                : o.bestScore > 0.5
                ? `👍`
                : `👎`) +
              ` "${o.target.toLowerCase()}" - ${(o.bestScore * 100).toFixed(
                0,
              )}%${
                o.bestAttemptText && o.bestScore < 0.99
                  ? ` ("${o.bestAttemptText.toLowerCase()}")`
                  : ``
              }`,
          )
          .join(`\n`)}
    
    Result: ${await applyCustomParams(msg, res.message)}`

      sentMessage.edit(embed)
    }, time + gracePeriod)
  },
}

const textOptions = [
  `If I destroy you, what business is it of yours?`,
  `Weakness and ignorance`,
  `barriers to survival`,
  `Your lack of fear is based on your ignorance.`,
  `In the face of madness`,
  `Rationality was powerless.`,
  `Time is the cruelest force of all.`,
  `“We'll send only a brain," he said.`,
  `Fate lies within the light cone.`,
  `Meant to be consumed by fire.`,
  `The universe is but a corpse puffing up.`,
  `long-term quantitative accumulation`,
  `It's easy to be led to the abyss.`,
  `In fundamental theory, one must be stupid.`,
  `Let's go drinking.`,
  `Go back to sleep like good bugs.`,
  `Six minutes to live`,
  `I'd type a little faster.`,
  `Any planet is 'Earth' to those that live on it.`,
  `The easiest way to solve a problem is to deny it exists.`,
  `It pays to be obvious.`,
  `All evil is good become cancerous.`,
  `A book worth banning is a book worth reading.`,
  `Bigger than the biggest thing ever`,
  `He sat back and sipped reflectively.`,
  `Apathetic bloody planet.`,
  `I've no sympathy at all.`,
  `Theft is property.`,
  `That is so amazingly amazing`,
  `I think I'd like to steal it.`,
  `Ghastly gray light congealed on the land`,
  `Constantly and quietly being filled.`,
  `An enormous breath being held.`,
  `Pretend that you have free will.`,
  `Civilization depends on self-deception.`,
  `Algorithmically incompressible.`,
  `The fullest possible use.`,
  `Open the pod bay doors please, HAL.`,
  `I'm afraid I can't do that.`,
  `Even in the future nothing works.`,
  `We live in a spaceship, dear.`,
  `Curse your sudden but inevitable betrayal!`,
  `You try to kill 'em right back!`,
  `Once, in flight school, I was laconic.`,
  `A grand entrance would not go amiss.`,
  `How did your brain even learn human speech?`,
  `You're welcome on my boat. God ain't.`,
]
