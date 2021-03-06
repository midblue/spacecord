const send = require(`./send`)
const { log } = require(`../botcommon`)
const Discord = require(`discord.js-light`)
const runYesNoVote = require(`./runYesNoVote`)
const story = require(`../../game/basics/story/story`)

module.exports = async ({ msg, part, cost, guild, willReplace }) => {
  msg.guild = msg.channel.guild
  log(msg, `Buy Equipment`, msg.channel.guild.name)

  const authorCrewMemberObject = guild.ship.members.find(
    (m) => m.id === msg.author.id,
  )
  if (!authorCrewMemberObject)
    return console.log(`no user found in buyEquipment`)

  if (cost > guild.ship.credits)
    return authorCrewMemberObject.message(story.buy.notEnoughMoney())

  // ---------- use vote caller stamina
  const staminaRes = authorCrewMemberObject.useStamina(`poll`)
  if (!staminaRes.ok) return

  const voteEmbed = new Discord.MessageEmbed()
  voteEmbed.setTitle(
    `Buy ${part.emoji} ${part.displayName} for \`💳 ${cost}\` credits? | Vote started by ${msg.author.nickname}`,
  )
  voteEmbed.description = willReplace
    ? `Warning: This part will replace your existing ${
        willReplace.emoji + ` ` || ``
      } ${willReplace.displayName}, which will be sold for 50% of market price.`
    : ``
  voteEmbed.fields = []

  const voteResult = await runYesNoVote({
    pollType: `buy`,
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
    voteEmbed.description = story.buy.equipment.voteFailed(part, cost)
    voteResult.sentMessage.edit(voteEmbed).catch((e) => {
      console.trace()
      console.log(e)
    })
    return
  }

  if (cost > guild.ship.credits)
    return guild.message(story.buy.notEnoughMoney())

  // vote passed
  guild.ship.logEntry(story.buy.equipment.votePassed(part, cost))

  voteEmbed.title = `Bought ${part.emoji} ${part.displayName} for \`💳 ${cost}\` credits`

  voteEmbed.description = story.buy.equipment.votePassed(part, cost)

  const { soldCredits, soldPart } = guild.ship.addPart(part, cost)
  if (soldCredits) {
    voteEmbed.description +=
      `\n\n` + story.sell.equipment.votePassed(soldPart, soldCredits)
  }

  voteEmbed.description += `\n\nYou have \`💳 ${Math.round(
    guild.ship.credits,
  )}\` credits remaining.`

  voteEmbed.description +=
    `\n\nYour ship is now carrying ${Math.round(
      (guild.ship.getTotalMass() / guild.ship.maxMass()) * 100,
    )}% of its maximum capacity.` +
    (guild.ship.isOverburdened()
      ? `\nYou're overburdened! You won't be able to move until you drop or sell something.`
      : ``)

  voteResult.sentMessage.edit(voteEmbed).catch((e) => {
    console.trace()
    console.log(e)
  })
}
