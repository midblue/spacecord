const send = require(`../actions/send`)
const { log, applyCustomParams, canEdit } = require(`../botcommon`)
const Discord = require(`discord.js`)
// const runCountingTest = require(`../actions/runCountingTest`)
const readyCheck = require(`../actions/readyCheck`)

module.exports = {
  tag: `trainEngineering`,
  pm: true,
  documentation: false,
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:trainengineering|engineeringtraining)$`,
      `gi`,
    ).exec(content)
  },
  async action({
    msg,
    author,
    guild,
    authorCrewMemberObject,
    staminaRequired,
  }) {
    log(msg, `Train Engineering`, msg.guild?.name)

    // ---------- use stamina
    const member =
      authorCrewMemberObject ||
      guild.ship.members.find((m) => m.id === msg.author.id)
    if (!member) return console.log(`no user found in trainEng`)
    if (!staminaRequired)
      staminaRequired = authorCrewMemberObject.staminaRequiredFor(`engineering`)
    const staminaRes = member.useStamina(staminaRequired)
    if (!staminaRes.ok) return send(msg, staminaRes.message)

    const emojiChoices = [
      `🚀`,
      `👾`,
      `🔭`,
      `🪐`,
      `☄️`,
      `🛸`,
      `👽`,
      `🛰`,
      `1️⃣`,
      `0️⃣`,
      `💫`,
      `🌌`,
      `🌠`,
      `🤖`,
    ]

    const choiceIndex = Math.floor(Math.random() * emojiChoices.length)

    const targetEmoji = emojiChoices[choiceIndex]
    emojiChoices.splice(choiceIndex, 1)

    const embed = new Discord.MessageEmbed()
      .setColor(APP_COLOR)
      .setTitle(`${author.nickname} | Engineering Training`)
      .setDescription(
        `The ship computer relies on a neural network to optimize ship systems, 
and it needs labeled training data to improve its performance. The input data is provided in **mojcode**, a special format used in modern ship computers.

         Count the number of \`${targetEmoji}\` in the following mojcode training data.`,
      )

    const SNIPPET_WIDTH = 5
    const SNIPPET_HEIGHT = 5

    let mojcodeSnippet = ``

    function randomNumber(min, max) {
      return Math.random() * (max - min) + min
    }

    const MIN_CHANCE = 0.5
    const MAX_CHANCE = 0.8

    const targetChance = randomNumber(MIN_CHANCE, MAX_CHANCE)

    for (i = 0; i < SNIPPET_HEIGHT; i++) {
      for (j = 0; j < SNIPPET_WIDTH; j++) {
        if (Math.random() < targetChance) {
          mojcodeSnippet += targetEmoji
        } else {
          const choiceIndex = Math.floor(Math.random() * emojiChoices.length)
          mojcodeSnippet += emojiChoices[choiceIndex]
        }
      }
      if (i != SNIPPET_HEIGHT - 1) {
        mojcodeSnippet += `\n`
      }
    }
    const regex = new RegExp(targetEmoji, `g`)
    const targetEmojiTotal = (mojcodeSnippet.match(regex) || []).length
    mojcodeSnippet += `\nDEBUG: COUNT=` + targetEmojiTotal
    const time = Math.floor(targetEmojiTotal * 0.2 * 1000)

    embed.description += `\nYou will have **${Math.round(
      time / 1000,
    )} seconds** to study the mojcode.`

    const sentMessage = (await send(msg, embed))[0]
    await readyCheck({ msg: sentMessage, embed, user: authorCrewMemberObject })

    const puzzleMessage = (await send(msg, mojcodeSnippet))[0]

    setTimeout(async () => {
      if (await canEdit(puzzleMessage)) puzzleMessage.delete()
      else puzzleMessage.edit(`\`Time's up! Make your guess!\``)
    }, time)

    const handler = async (receivedMessage) => {
      if (receivedMessage.author.id != msg.author.id) return

      const content = receivedMessage.content
      const guess = parseInt(content)
      if (isNaN(guess)) return

      clearTimeout(noInputTimeout)

      if (await canEdit(receivedMessage)) receivedMessage.delete()
      collector.stop()
      end(guess)
    }

    const collector = new Discord.MessageCollector(msg.channel, handler)
    const noInputTimeout = setTimeout(async () => {
      if (await canEdit(sentMessage)) sentMessage.delete()
      if (await canEdit(puzzleMessage)) puzzleMessage.delete()
      collector.stop()
      end(0)
    }, 20 * 1000)

    const end = async (guess) => {
      const guessError = Math.abs(targetEmojiTotal - guess)
      // anything less than .5 is 0, and xp scales linearly 0-100% from .5-1
      const successRatio = Math.max(
        (Math.max(0, 1 - guessError / targetEmojiTotal) - 0.5) / 0.5,
        0,
      )

      const res = authorCrewMemberObject.train(`engineering`, successRatio)

      description = ``
      if (successRatio === 1) {
        description += `Excellent — You found all ${guess} ${targetEmoji} in the training data!\n`
      } else if (successRatio > 0.8) {
        description += `Wow, you were close — You found ${guess} of ${targetEmojiTotal} ${targetEmoji} in the training data.\n`
      } else if (successRatio > 0.25) {
        description += `Thanks for your effort — You found ${guess} of ${targetEmojiTotal} ${targetEmoji} in the training data!\n`
      } else if (successRatio > 0) {
        description += `This must have been a tough one — At least you found ${guess} of ${targetEmojiTotal} ${targetEmoji} in the training data!\n`
      } else {
        description += `Hey! Did you forget to count the ${targetEmoji}? Try again!\n`
      }

      description += `${await applyCustomParams(msg, res.message)}`

      embed.setDescription(description)
      if (await canEdit(sentMessage)) sentMessage.edit(embed)
      else send(msg, embed)
    }
  },
}
