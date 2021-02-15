const send = require('./send')
const { log } = require('../botcommon')
const {
  numberToEmoji,
  emojiToNumber,
  capitalize,
  msToTimeString,
  distance,
  percentToTextBars,
} = require('../../common')
const awaitReaction = require('./awaitReaction')
const Discord = require('discord.js-light')
const runYesNoVote = require('./runYesNoVote')
const story = require('../../game/basics/story/story')
const runPoll = require('./runPoll')
const cargo = require('../../game/basics/cargo')

module.exports = async ({ msg, type, cost, guild, amount }) => {
  msg.guild = msg.channel.guild
  log(msg, 'Sell Cargo', msg.channel.guild.name)

  const heldCargo = guild.ship.cargo.find((c) => c.type === type)
  if (!heldCargo || !heldCargo.amount) return
  const cargoData = cargo[type]

  // ---------- use vote caller stamina
  const authorCrewMemberObject = guild.ship.members.find(
    (m) => m.id === msg.author.id,
  )
  if (!authorCrewMemberObject) return console.log('no user found in sellCargo')
  const staminaRes = authorCrewMemberObject.useStamina('poll')
  if (!staminaRes.ok) return send(msg, staminaRes.message)

  const voteEmbed = new Discord.MessageEmbed()
  voteEmbed.setTitle(
    `Sell ${amount} ${
      amount === 1 ? process.env.WEIGHT_UNIT : process.env.WEIGHT_UNITS
    } of ${cargoData.emoji} ${
      cargoData.displayName
    } for \`💳${cost}\` credits per ${process.env.WEIGHT_UNIT} (\`💳${
      cost * amount
    }\` total) ? | Vote started by ${msg.author.nickname}`,
  )

  const voteResult = await runYesNoVote({
    pollType: 'sell',
    embed: voteEmbed,
    minimumMemberPercent: 0.1,
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
    voteEmbed.description = story.sell.cargo.voteFailed(cargoData, amount, cost)
    voteResult.sentMessage.edit(voteEmbed)
    return
  }

  // vote passed
  guild.ship.removeCargo(type, amount, cost)

  guild.ship.logEntry(story.sell.cargo.votePassed(cargoData, amount, cost))

  voteEmbed.title = `Sold ${amount} ${
    amount === 1 ? process.env.WEIGHT_UNIT : process.env.WEIGHT_UNITS
  } of ${cargoData.emoji} ${cargoData.displayName} for \`💳${
    cost * amount
  }\` credits.`

  voteEmbed.description =
    `You now have \`💳${Math.round(guild.ship.credits)}\` credits.` +
    '\n\nShip weight is ' +
    percentToTextBars(
      guild.ship.getTotalWeight() / guild.ship.equipment.chassis[0].maxWeight,
    ) +
    Math.round(guild.ship.getTotalWeight()) +
    '/' +
    Math.round(guild.ship.equipment.chassis[0].maxWeight) +
    ' ' +
    process.env.WEIGHT_UNITS

  voteResult.sentMessage.edit(voteEmbed)
}
