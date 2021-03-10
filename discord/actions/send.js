const { applyCustomParams } = require(`../botcommon`)

module.exports = async function (
  msgOrChannelOrUser,
  messages = ``,
  surroundingCharacters = `\`\`\``,
) {
  const sentMessages = []
  if (!Array.isArray(messages)) messages = [messages]
  for (let message of messages) {
    const splitMessage = []
    // * if rich embeds, go ahead and send them
    if (typeof message === `object`) splitMessage.push(message)
    // * otherwise, split messages because Discord won't let us send longer than 2000 characters
    else {
      message = `${message}` // some types (i.e. raw numbers) couldn't have 'indexOf' run on them. this makes everything a string.
      // * here, we also apply custom params we've built into our story text.
      let remainingText = msgOrChannelOrUser.username // for now we ignore custom params for DMs
        ? message
        : await applyCustomParams(msgOrChannelOrUser, message)
      const surroundingCharactersToUse =
        remainingText.indexOf(`\``) === -1 ? surroundingCharacters : ``
      while (remainingText.length > 0) {
        splitMessage.push(
          surroundingCharactersToUse +
            remainingText.substring(0, 1990) +
            surroundingCharactersToUse,
        )
        remainingText = remainingText.substring(1990)
      }
    }

    for (const textEl of splitMessage) {
      // const embed = new Discord.MessageEmbed()
      //   .setColor(APP_COLOR)
      //   .setDescription(textEl)
      const sendableTarget = msgOrChannelOrUser.channel
        ? msgOrChannelOrUser.channel
        : msgOrChannelOrUser.send
        ? msgOrChannelOrUser
        : msgOrChannelOrUser.author
      sentMessages.push(
        await sendableTarget.send(textEl).catch((err) => {
          console.error(`Failed to send!`, err.message)
        }),
      )
    }
  }
  return sentMessages
}
