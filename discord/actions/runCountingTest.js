const send = require('./send')
const Discord = require('discord.js')

module.exports = ({ msg, sentMessage, embed, targetEmoji, emojiChoices }) => {
  return new Promise(async (resolve) => {
    const SNIPPET_WIDTH = 5
    const SNIPPET_HEIGHT = 5

    var mojcodeSnippet = ''

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
          var choiceIndex = Math.floor(Math.random() * emojiChoices.length)
          mojcodeSnippet += emojiChoices[choiceIndex]
        }
      }
      if (i != SNIPPET_HEIGHT - 1) {
        mojcodeSnippet += '\n'
      }
    }
    const regex = new RegExp(targetEmoji, 'g')
    var targetEmojiTotal = (mojcodeSnippet.match(regex) || []).length
    mojcodeSnippet += '\nDEBUG: COUNT=' + targetEmojiTotal
    const time = Math.floor(targetEmojiTotal * 0.2 * 1000)

    embed.description += `\nYou have ${Math.round(
      time / 1000,
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

      const guessError = Math.abs(targetEmojiTotal - guess)
      if (guessError / targetEmojiTotal < 0) {
        var rewardXp = 0
      } else {
        var rewardXp = 1500 - 145 * guessError ** 2
      }

      if (rewardXp < 0) rewardXp = 0

      clearTimeout(noInputTimeout)

      if (!receivedMessage.deleted) receivedMessage.delete()
      collector.stop()
      resolve({
        rewardXp: rewardXp,
        guess: guess,
        correctAnswer: targetEmojiTotal,
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
