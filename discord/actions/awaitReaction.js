const send = require('./send')

module.exports = async (msg, reactions, embed, time = 60000) => {
  return new Promise(async (resolve) => {
    if (embed) {
      embed.setFooter(`Listening for commands...`)
      embed.fields.push({
        name: `Commands`,
        value: Object.keys(reactions)
          .map((emoji) => `${emoji} - ${reactions[emoji].label}`)
          .join('\n'),
      })
      msg.edit(embed)
    }
    for (let r of Object.keys(reactions)) msg.react(r)

    const filter = (reaction, user) =>
      !user.bot && Object.keys(reactions).includes(reaction.emoji.name)

    const collector = msg.createReactionCollector(filter, { time })
    collector.on('collect', (reaction, user) => {
      reactions[reaction.emoji.name].action(user)
    })

    collector.on('end', (collected) => {
      if (embed) {
        delete embed.footer
        embed.fields.pop()
        msg.edit(embed)
      }
      msg.reactions.removeAll().catch((e) => {})
      resolve()
    })
  })
}
