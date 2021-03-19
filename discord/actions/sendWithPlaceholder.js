const { canEdit } = require(`../botcommon`)
const send = require(`./send`)

module.exports = async function (
  placeholder,
  msgOrChannelOrUser,
  messageGenerator,
  surroundingCharacters = `\`\`\``,
) {
  return new Promise(async (resolve) => {
    let messageContent = false,
      messageObject = false

    const applyFinalContent = async () => {
      if (canEdit(messageObject)) messageObject.delete()
      const realMessage = (
        await send(msgOrChannelOrUser, messageContent, surroundingCharacters)
      )[0]
      resolve(realMessage)
    }

    messageGenerator().then((content) => {
      messageContent = content
      if (messageObject) applyFinalContent()
    })
    send(msgOrChannelOrUser, placeholder).then((messages) => {
      messageObject = messages[0]
      if (messageContent) applyFinalContent()
    })
  })
}
