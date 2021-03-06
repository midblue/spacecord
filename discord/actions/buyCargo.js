const send = require(`./send`)
const { log } = require(`../botcommon`)
const { percentToTextBars } = require(`../../common`)
const Discord = require(`discord.js-light`)
const runYesNoVote = require(`./runYesNoVote`)
const story = require(`../../game/basics/story/story`)
const cargo = require(`../../game/basics/cargo`)

module.exports = async ({ msg, type, cost, guild, amount }) => {
  msg.guild = msg.channel.guild
  log(msg, `Buy Cargo`, msg.channel.guild.name)

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

  const cargoData = cargo[type]

  const voteEmbed = new Discord.MessageEmbed()
  voteEmbed.setTitle(
    `Buy ${amount} ${amount === 1 ? WEIGHT_UNIT : WEIGHT_UNITS} of ${
      cargoData.emoji
    } ${
      cargoData.displayName
    } for \`💳 ${cost}\` credits per ${WEIGHT_UNIT} (\`💳 ${
      cost * amount
    }\` total)? | Vote started by ${msg.author.nickname}`,
  )

  const voteResult = await runYesNoVote({
    pollType: `trade`,
    embed: voteEmbed,
    minimumMemberPercent: 0.1,
    msg,
    guild,
    cleanUp: false,
  })
  if (!voteResult.ok) return send(msg, voteResult.message)
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
    voteEmbed.description = story.buy.cargo.voteFailed(cargo, amount, cost)
    voteResult.sentMessage.edit(voteEmbed).catch((e) => {
      console.trace()
      console.log(e)
    })
    return
  }

  if (cost > guild.ship.credits)
    return guild.message(story.buy.notEnoughMoney())

  // vote passed
  guild.ship.logEntry(story.buy.cargo.votePassed(cargo, amount, cost))

  voteEmbed.title = `Bought ${amount} ${
    amount === 1 ? WEIGHT_UNIT : WEIGHT_UNITS
  } of ${cargoData.emoji} ${cargoData.displayName} for \`💳 ${
    cost * amount
  }\` credits`

  guild.ship.addCargo(type, amount, cost)

  voteEmbed.description =
    `You have \`💳 ${Math.round(guild.ship.credits)}\` credits remaining.` +
    `\n\nShip mass is ` +
    percentToTextBars(guild.ship.getTotalMass() / guild.ship.maxMass()) +
    Math.round(guild.ship.getTotalMass()) +
    `/` +
    Math.round(guild.ship.maxMass()) +
    ` ` +
    WEIGHT_UNITS +
    (guild.ship.isOverburdened()
      ? `\nYou're overburdened! You won't be able to move until you drop or sell something.`
      : ``)

  voteResult.sentMessage.edit(voteEmbed).catch((e) => {
    console.trace()
    console.log(e)
  })
}
