const { username } = require('../botcommon')
const defaultServerSettings = require('../defaults/defaultServerSettings')

module.exports = async function (
  msgOrChannel,
  messages = '',
  surroundingCharacters = '```',
) {
  const sentMessages = []
  if (!Array.isArray(messages)) messages = [messages]
  for (let message of messages) {
    const splitMessage = []
    // * if rich embeds, go ahead and send them
    if (typeof message === 'object') splitMessage.push(message)
    // * otherwise, split messages because Discord won't let us send longer than 2000 characters
    else {
      // * here, we also apply custom params we've built into our story text.
      let remainingText = await applyCustomParams(msgOrChannel, message)
      const surroundingCharactersToUse =
        remainingText.indexOf('`') === -1 ? surroundingCharacters : ''
      while (remainingText.length > 0) {
        splitMessage.push(
          surroundingCharactersToUse +
            remainingText.substring(0, 1990) +
            surroundingCharactersToUse,
        )
        remainingText = remainingText.substring(1990)
      }
    }

    for (let textEl of splitMessage)
      sentMessages.push(
        await (msgOrChannel.channel ? msgOrChannel.channel : msgOrChannel)
          .send(textEl)
          .catch((err) => {
            console.error('Failed to send!', err.message)
          }),
      )
  }
  return sentMessages
}

const customParams = [
  {
    regex: /%username%(\d+)%/,
    async replace([unused, userId], msgOrChannel) {
      return await username(msgOrChannel, userId)
    },
  },
  {
    regex: /%command%(.+)%/,
    async replace([unused, command], msgOrChannel) {
      // todo get server command prefix here (once we implement that)
      return defaultServerSettings.prefix + command
    },
  },
]
function applyCustomParams(msgOrChannel, text) {
  return new Promise(async (resolve) => {
    let newText = text
    for (let param of customParams) {
      param.regex.lastIndex = 0
      let foundInstance = param.regex.exec(newText)
      while (foundInstance) {
        const replaceValue = await param.replace(foundInstance, msgOrChannel)
        newText = newText.replace(foundInstance[0], replaceValue)
        param.regex.lastIndex = 0
        foundInstance = param.regex.exec(newText)
      }
    }
    resolve(newText)
  })
}
