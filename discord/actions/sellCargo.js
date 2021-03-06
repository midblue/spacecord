const { log } = require(`../botcommon`)
const { percentToTextBars } = require(`../../common`)
const Discord = require(`discord.js-light`)
const runYesNoVote = require(`./runYesNoVote`)
const story = require(`../../game/basics/story/story`)
const cargo = require(`../../game/basics/cargo`)

module.exports = async ({ msg, type, cost, guild, amount }) => {
  msg.guild = msg.channel.guild
  log(msg, `Sell Cargo`, msg.channel.guild.name)

  const heldCargo = guild.ship.cargo.find((c) => c.cargoType === type)
  if (!heldCargo || !heldCargo.amount) return
  const cargoData = cargo[type]

  const authorCrewMemberObject = guild.ship.members.find(
    (m) => m.id === msg.author.id,
  )
  if (!authorCrewMemberObject) return console.log(`no user found in sellCargo`)

  // ---------- use vote caller stamina
  const staminaRes = authorCrewMemberObject.useStamina(`poll`)
  if (!staminaRes.ok) return

  const voteEmbed = new Discord.MessageEmbed()
  voteEmbed.setTitle(
    `Sell ${amount} ${amount === 1 ? WEIGHT_UNIT : WEIGHT_UNITS} of ${
      cargoData.emoji
    } ${
      cargoData.displayName
    } for \`💳 ${cost}\` credits per ${WEIGHT_UNIT} (\`💳 ${
      cost * amount
    }\` total) ? | Vote started by ${msg.author.nickname}`,
  )

  const voteResult = await runYesNoVote({
    pollType: `sell`,
    embed: voteEmbed,
    minimumMemberPercent: 0.1,
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
    voteEmbed.description = story.sell.cargo.voteFailed(cargoData, amount, cost)
    voteResult.sentMessage.edit(voteEmbed).catch((e) => {
      console.trace()
      console.log(e)
    })
    return
  }

  // vote passed
  guild.ship.removeCargo(type, amount, cost)

  guild.ship.logEntry(story.sell.cargo.votePassed(cargoData, amount, cost))

  voteEmbed.title = `Sold ${amount} ${
    amount === 1 ? WEIGHT_UNIT : WEIGHT_UNITS
  } of ${cargoData.emoji} ${cargoData.displayName} for \`💳 ${
    cost * amount
  }\` credits.`

  voteEmbed.description =
    `You now have \`💳 ${Math.round(guild.ship.credits)}\` credits.` +
    `\n\nShip mass is ` +
    percentToTextBars(guild.ship.getTotalMass() / guild.ship.maxMass()) +
    Math.round(guild.ship.getTotalMass()) +
    `/` +
    Math.round(guild.ship.maxMass()) +
    ` ` +
    WEIGHT_UNITS

  voteResult.sentMessage.edit(voteEmbed).catch((e) => {
    console.trace()
    console.log(e)
  })
}
