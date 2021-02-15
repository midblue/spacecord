const send = require('./send')
const { log } = require('../botcommon')
const {
  numberToEmoji,
  emojiToNumber,
  capitalize,
  msToTimeString,
  distance,
} = require('../../common')
const awaitReaction = require('./awaitReaction')
const Discord = require('discord.js-light')
const runYesNoVote = require('./runYesNoVote')
const story = require('../../game/basics/story/story')
const runPoll = require('./runPoll')

module.exports = async ({ msg, part, cost, guild }) => {
  msg.guild = msg.channel.guild
  log(msg, 'Sell Equipment', msg.channel.guild.name)

  if (!guild.ship.equipment[part.type].find((p) => p === part)) return

  // ---------- use vote caller stamina
  const authorCrewMemberObject = guild.ship.members.find(
    (m) => m.id === msg.author.id,
  )
  if (!authorCrewMemberObject)
    return console.log('no user found in sellEquipment')
  const staminaRes = authorCrewMemberObject.useStamina('poll')
  if (!staminaRes.ok) return send(msg, staminaRes.message)

  const voteEmbed = new Discord.MessageEmbed()
  voteEmbed.setTitle(
    `Sell ${part.emoji} ${part.displayName} for \`💳${cost}\` credits? | Vote started by ${msg.author.nickname}`,
  )

  const voteResult = await runYesNoVote({
    pollType: 'sell',
    embed: voteEmbed,
    minimumMemberPercent: 0.2,
    msg,
    ship: guild.ship,
    cleanUp: false,
  })
  if (!voteResult.ok) return send(msg, voteResult.message)
  voteEmbed.fields = []
  if (voteResult.insufficientVotes) {
    voteEmbed.description = story.vote.insufficientVotes()
    voteResult.sentMessage.edit(voteEmbed)
    return
  }
  if (!voteResult.result) {
    voteEmbed.description = story.sell.equipment.voteFailed(part, cost)
    voteResult.sentMessage.edit(voteEmbed)
    return
  }

  // vote passed
  guild.ship.removePart(part, cost)

  guild.ship.logEntry(story.sell.equipment.votePassed(part, cost))

  voteEmbed.title = `Sold ${part.emoji} ${part.displayName} for \`💳${cost}\` credits`

  voteEmbed.description =
    `You now have \`💳${Math.round(guild.ship.credits)}\` credits.` +
    `\n\nYour ship is now carrying ${Math.round(
      (guild.ship.getTotalWeight() /
        guild.ship.equipment.chassis[0].maxWeight) *
        100,
    )}% of its maximum capacity.`

  voteResult.sentMessage.edit(voteEmbed)
}
