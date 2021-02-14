const send = require('./send')
const { log } = require('../botcommon')
const {
  numberToEmoji,
  capitalize,
  msToTimeString,
  distance,
  usageTag,
} = require('../../common')
const awaitReaction = require('./awaitReaction')
const Discord = require('discord.js-light')
const runYesNoVote = require('./runYesNoVote')
const story = require('../../game/basics/story/story')
const runPoll = require('./runPoll')

module.exports = async ({ msg, guild, planet }) => {
  log(msg, 'Land', msg.guild.name)

  // ---------- check if in range
  const inRange =
    distance(...guild.ship.location, ...planet.location) <=
    guild.ship.equipment.chassis[0].interactRadius
  if (!inRange) return send(msg, `That planet isn't in range anymore!`)

  // ---------- use vote caller stamina
  const authorCrewMemberObject = guild.ship.members.find(
    (m) => m.id === msg.author.id,
  )
  if (!authorCrewMemberObject) return console.log('no user found in land')
  const staminaRes = authorCrewMemberObject.useStamina('land')
  if (!staminaRes.ok) return send(msg, staminaRes.message)

  // ---------- vote on landing
  const voteEmbed = new Discord.MessageEmbed()
    .setColor(process.env.APP_COLOR)
    .setTitle(
      `Land on 🪐${planet.name}? | Vote started by ${msg.author.nickname}`,
    )
  voteEmbed.description = `It will take ${usageTag('land')} to land.`

  const {
    ok,
    message,
    result,
    yesPercent,
    yesVoters,
    sentMessage: voteMessage,
  } = await runYesNoVote({
    pollType: 'land',
    embed: voteEmbed,
    msg,
    ship: guild.ship,
    cleanUp: false,
  })
  if (!ok) return send(msg, message)

  voteEmbed.fields = []
  if (!result) {
    guild.ship.logEntry(story.land.voteFailed())
    voteEmbed.description = story.land.voteFailed()
    voteMessage.edit(voteEmbed)
    return
  }
  // vote passed

  // ---------- use ship power
  const powerRes = guild.ship.usePower('land')
  if (!powerRes.ok) return send(msg, powerRes.message)

  guild.ship.logEntry(story.land.votePassed(yesPercent, planet))
  voteEmbed.description = story.land.votePassed(yesPercent, planet)
  voteMessage.edit(voteEmbed)

  // land
  guild.ship.land({ planet, msg })
}
