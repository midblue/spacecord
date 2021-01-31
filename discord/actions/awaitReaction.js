module.exports = async ({
  msg,
  reactions,
  embed,
  time = 60000,
  listeningType,
  respondeeFilter,
}) => {
  return new Promise(async (resolve) => {
    if (embed) {
      embed.setFooter(
        `Listening for ${
          listeningType ? listeningType : reactions ? 'commands' : 'reactions'
        }...`,
      )
      if (reactions && reactions[0].label)
        embed.fields.push({
          name: `Commands`,
          value: reactions
            .map(({ emoji, label }) => `${emoji} - ${label}`)
            .join('\n'),
        })
      msg.edit(embed)
    }

    if (reactions) for (let r of reactions) msg.react(r.emoji)

    const filter = (reaction, user) =>
      !user.bot &&
      (respondeeFilter ? respondeeFilter(user) : true) &&
      (reactions
        ? reactions.map((r) => r.emoji).includes(reaction.emoji.name)
        : true)

    const collector = msg.createReactionCollector(filter, { time })

    collector.on('collect', (reaction, user) => {
      if (
        !reactions ||
        !reactions[reaction.emoji.name] ||
        !reactions[reaction.emoji.name].action
      )
        return
      reactions[reaction.emoji.name].action({ user, embed, msg, reaction })
    })

    collector.on('end', (collected) => {
      if (embed) {
        delete embed.footer
        if (reactions && reactions[0].label) embed.fields.pop()
        msg.edit(embed)
      }
      msg.reactions.removeAll().catch((e) => {})
      resolve(collected)
    })
  })
}
