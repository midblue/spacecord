const send = require(`./send`)
const Discord = require(`discord.js`)
const gamecommon = require(`../../game/gamecommon`)


module.exports = ({ msg, sentMessage, embed, targetEmoji, emojiChoices, skillLevel }) => {
  return new Promise(async (resolve) => {
    const SNIPPET_WIDTH = 5
    const SNIPPET_HEIGHT = 5

    let mojcodeSnippet = ``

    function randomNumber (min, max) {
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

    embed.description += `\nYou have ${Math.round(
      time / 1000
    )} seconds to study the mojcode.`
    sentMessage.edit(embed)

    await SLEEP(1 * 1000)

    const puzzleMessage = (await send(msg, mojcodeSnippet))[0]

    setTimeout(() => {
      if (!puzzleMessage.deleted) puzzleMessage.delete()
    }, time)

    const handler = (receivedMessage) => {
      if (receivedMessage.author.id != msg.author.id) return

      const content = receivedMessage.content
      const guess = parseInt(content)
      if (isNaN(guess)) return


      const minigameScore = guess / content

      const rewardXp = gamecommon.getTrainingXp(minigameScore, skillLevel)

      clearTimeout(noInputTimeout)

      if (!receivedMessage.deleted) receivedMessage.delete()
      collector.stop()
      resolve({
        rewardXp: rewardXp,
        guess: guess,
        correctAnswer: targetEmojiTotal
      })
    }

    const collector = new Discord.MessageCollector(msg.channel, handler)
    const noInputTimeout = setTimeout(() => {
      if (!sentMessage.deleted) sentMessage.delete()
      if (!puzzleMessage.deleted) puzzleMessage.delete()
      collector.stop()
      resolve({})
    }, 20 * 1000)
  })
}
