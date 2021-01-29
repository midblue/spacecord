const { resolveTxt } = require('dns')
const { resolve } = require('path')
const { username } = require('../common')

module.exports = async function (msg, text, surroundingCharacters = '```') {
  const messages = []
  // * if rich embeds, go ahead and send them
  if (typeof text === 'object') messages.push(text)
  // * otherwise, split messages because Discord won't let us send longer than 2000 characters
  else {
    // * here, we also apply custom params we've built into our story text.
    let remainingText = await applyCustomParams(msg, text)
    while (remainingText.length > 0) {
      messages.push(
        surroundingCharacters +
          remainingText.substring(0, 1990) +
          surroundingCharacters,
      )
      remainingText = remainingText.substring(1990)
    }
  }

  for (let message of messages)
    msg.channel.send(message).catch((err) => {
      console.error('Failed to send!', err.message)
    })
}

const customParams = [
  {
    regex: /%username%(\d+)/,
    async replace([unused, userId], msg) {
      return await username(msg, userId)
    },
  },
]
function applyCustomParams(msg, text) {
  return new Promise(async (resolve) => {
    let newText = text
    for (let param of customParams) {
      param.regex.lastIndex = 0
      let foundInstance = param.regex.exec(newText)
      while (foundInstance) {
        const replaceValue = await param.replace(foundInstance, msg)
        newText = newText.replace(foundInstance[0], replaceValue)
        param.regex.lastIndex = 0
        foundInstance = param.regex.exec(newText)
      }
    }
    resolve(newText)
  })
}
