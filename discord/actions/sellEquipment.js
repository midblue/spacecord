const { log } = require(`../botcommon`)
const Discord = require(`discord.js-light`)
const runYesNoVote = require(`./runYesNoVote`)
const story = require(`../../game/basics/story/story`)

module.exports = async ({ msg, part, cost, guild }) => {
  msg.guild = msg.channel.guild
  log(msg, `Sell Equipment`, msg.channel.guild.name)

  if (
    !guild.ship.equipment
      .find((e) => e.equipmentType === part.type)
      .list.find((p) => p === part)
  )
    return

  const authorCrewMemberObject = guild.ship.members.find(
    (m) => m.id === msg.author.id,
  )
  if (!authorCrewMemberObject)
    return console.log(`no user found in sellEquipment`)

  // ---------- use vote caller stamina
  const staminaRes = authorCrewMemberObject.useStamina(`poll`)
  if (!staminaRes.ok) return

  const voteEmbed = new Discord.MessageEmbed()
  voteEmbed.setTitle(
    `Sell ${part.emoji} ${part.displayName} for \`💳 ${cost}\` credits? | Vote started by ${msg.author.nickname}`,
  )

  const voteResult = await runYesNoVote({
    pollType: `sell`,
    embed: voteEmbed,
    minimumMemberPercent: 0.2,
    msg,
    guild,
    cleanUp: false,
  })
  if (!voteResult.ok) return guild.message(voteResult.message)
  voteEmbed.fields = []
  if (voteResult.insufficientVotes) {
    voteEmbed.description = story.vote.insufficientVotes()
    voteResult.sentMessage.edit(voteEmbed).catch((e) => {
      console.trace()
      console.log(e)
    })
    return
  }
  if (!voteResult.result) {
    voteEmbed.description = story.sell.equipment.voteFailed(part, cost)
    voteResult.sentMessage.edit(voteEmbed).catch((e) => {
      console.trace()
      console.log(e)
    })
    return
  }

  // vote passed
  guild.ship.removePart(part, cost)

  guild.ship.logEntry(story.sell.equipment.votePassed(part, cost))

  voteEmbed.title = `Sold ${part.emoji} ${part.displayName} for \`💳 ${cost}\` credits`

  voteEmbed.description =
    `You now have \`💳 ${Math.round(guild.ship.credits)}\` credits.` +
    `\n\nYour ship is now carrying ${Math.round(
      (guild.ship.getTotalMass() / guild.ship.maxMass()) * 100,
    )}% of its maximum capacity.`

  voteResult.sentMessage.edit(voteEmbed).catch((e) => {
    console.trace()
    console.log(e)
  })
}
