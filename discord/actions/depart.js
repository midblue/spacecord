const send = require(`./send`)
const { log } = require(`../botcommon`)
const { distance, usageTag } = require(`../../common`)
const Discord = require(`discord.js-light`)
const runYesNoVote = require(`./runYesNoVote`)
const story = require(`../../game/basics/story/story`)
const manager = require(`../../game/manager`)

module.exports = async ({ msg, guild, planet }) => {
  log(msg, `Depart`, msg.guild.name)

  if (!planet) {
    planet = manager.game.planets.find(
      (p) => p.name === guild.ship.status.docked
    )
  }
  if (!planet) return

  // ---------- use vote caller stamina
  const authorCrewMemberObject = guild.ship.members.find(
    (m) => m.id === msg.author.id
  )
  if (!authorCrewMemberObject) return console.log(`no user found in depart`)
  const staminaRes = authorCrewMemberObject.useStamina(`depart`)
  if (!staminaRes.ok) return send(msg, staminaRes.message)

  // ---------- vote on departing
  const voteEmbed = new Discord.MessageEmbed()
    .setColor(APP_COLOR)
    .setTitle(
      `Depart from 🪐${planet.name}? | Vote started by ${msg.author.nickname}`
    )

  const {
    ok,
    message,
    result,
    yesPercent,
    yesVoters,
    sentMessage: voteMessage
  } = await runYesNoVote({
    pollType: `depart`,
    embed: voteEmbed,
    msg,
    guild,
    cleanUp: false
  })
  if (!ok) return send(msg, message)

  voteEmbed.fields = []
  if (!result) {
    guild.ship.logEntry(story.depart.voteFailed())
    voteEmbed.description = story.depart.voteFailed()
    voteMessage.edit(voteEmbed)
    return
  }
  // vote passed

  guild.ship.logEntry(story.depart.votePassed(yesPercent, planet))
  voteEmbed.title = `Departed from 🪐${planet.name}`
  voteEmbed.description = story.depart.votePassed(yesPercent, planet)

  // depart
  const res = guild.ship.depart({ planet, msg })
  if (res.message) voteEmbed.description += `\n\n` + res.message

  voteMessage.edit(voteEmbed)
}
