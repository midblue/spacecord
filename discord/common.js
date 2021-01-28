module.exports = {
  logCommand(msg, command, context) {
    console.log(
      `${
        msg.guild ? msg.guild.name : 'Private Message'
      } - ${command} (${context}) `,
    )
  },
}
