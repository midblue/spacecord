const send = require(`./send`)
const { log } = require(`../botcommon`)
const Discord = require(`discord.js-light`)
const runYesNoVote = require(`./runYesNoVote`)
const story = require(`../../game/basics/story/story`)
const manager = require(`../../game/manager`)
const message = require(`./pushToGuild`)

module.exports = async ({ msg, guild, planet }) => {
  log(msg, `Depart`, msg.guild?.name)

  if (!planet) {
    planet = manager.planets.find((p) => p.name === guild.ship.status.docked)
  }
  if (!planet) return

  const authorCrewMemberObject = guild.ship.members.find(
    (m) => m.id === msg.author.id,
  )
  if (!authorCrewMemberObject) return console.log(`no user found in depart`)

  // ---------- use vote caller stamina
  const staminaRes = authorCrewMemberObject.useStamina(`depart`)
  if (!staminaRes.ok) return

  // ---------- vote on departing
  const voteEmbed = new Discord.MessageEmbed()
    .setColor(APP_COLOR)
    .setTitle(
      `Depart from 🪐${planet.name}? | Vote started by ${msg.author.nickname}`,
    )

  const {
    ok,
    message,
    result,
    yesPercent,
    yesVoters,
    sentMessage: voteMessage,
  } = await runYesNoVote({
    pollType: `depart`,
    embed: voteEmbed,
    msg,
    guild,
    cleanUp: false,
  })
  if (!ok) return guild.message(message)

  voteEmbed.fields = []
  if (!result) {
    guild.ship.logEntry(story.depart.voteFailed())
    voteEmbed.description = story.depart.voteFailed()
    voteMessage.edit(voteEmbed).catch((e) => {
      console.trace()
      console.log(e)
    })
    return
  }
  // vote passed

  guild.ship.logEntry(story.depart.votePassed(yesPercent, planet))
  voteEmbed.title = `Departed from 🪐${planet.name}`
  voteEmbed.description = story.depart.votePassed(yesPercent, planet)

  // depart
  const res = guild.ship.depart({ planet, msg })
  if (res.message) voteEmbed.description += `\n\n` + res.message

  voteMessage.edit(voteEmbed).catch((e) => {
    console.trace()
    console.log(e)
  })

  return true
}
