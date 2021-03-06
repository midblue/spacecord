const { log } = require(`../botcommon`)
const { distance, usageTag } = require(`../../common`)
const Discord = require(`discord.js-light`)
const runYesNoVote = require(`./runYesNoVote`)
const story = require(`../../game/basics/story/story`)

module.exports = async ({ msg, guild, planet }) => {
  log(msg, `Land`, msg.guild?.name)

  const authorCrewMemberObject = guild.ship.members.find(
    (m) => m.id === msg.author.id,
  )
  if (!authorCrewMemberObject) return console.log(`no user found in land`)

  // ---------- check if in range
  const inRange =
    distance(...guild.ship.location, ...planet.location) <=
    guild.ship.interactRadius()
  if (!inRange)
    return authorCrewMemberObject.message(`That planet isn't in range anymore!`)

  // ---------- use vote caller stamina
  const staminaRes = authorCrewMemberObject.useStamina(`land`)
  if (!staminaRes.ok) return

  // ---------- vote on landing
  const voteEmbed = new Discord.MessageEmbed()
    .setColor(APP_COLOR)
    .setTitle(
      `Land on 🪐${planet.name}? | Vote started by ${msg.author.nickname}`,
    )

  const {
    ok,
    message,
    result,
    yesPercent,
    yesVoters,
    sentMessage: voteMessage,
  } = await runYesNoVote({
    pollType: `land`,
    embed: voteEmbed,
    msg,
    guild,
    cleanUp: false,
  })
  if (!ok) return guild.message(message)

  voteEmbed.fields = []
  if (!result) {
    guild.ship.logEntry(story.land.voteFailed())
    voteEmbed.description = story.land.voteFailed()
    voteMessage.edit(voteEmbed).catch((e) => {
      console.trace()
      console.log(e)
    })
    return
  }
  // vote passed

  guild.ship.logEntry(story.land.votePassed(yesPercent, planet))
  voteEmbed.title = `Landed on 🪐${planet.name}`
  voteEmbed.description = story.land.votePassed(yesPercent, planet)

  // land
  const res = guild.ship.land({ planet })
  if (res.message) voteEmbed.description += `\n\n` + res.message

  voteMessage.edit(voteEmbed).catch((e) => {
    console.trace()
    console.log(e)
  })
}
