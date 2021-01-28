module.exports = function (msg, text) {
  const messages = []
  // * if rich embeds, go ahead and send them
  if (typeof text === 'object') messages.push(text)
  // * otherwise, split messages because Discord won't let us send longer than 2000 characters
  else {
    let remainingText = text
    while (remainingText.length > 0) {
      messages.push(`${remainingText.substring(0, 1990)}`)
      remainingText = remainingText.substring(1990)
    }
  }

  for (let message of messages)
    msg.channel.send(message).catch((err) => {
      console.error('Failed to send!', err.message)
    })
}
