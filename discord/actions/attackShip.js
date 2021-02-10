const send = require('./send')
const { log } = require('../botcommon')
const {
  numberToEmoji,
  capitalize,
  msToTimeString,
  distance,
} = require('../../common')
const awaitReaction = require('./awaitReaction')
const Discord = require('discord.js-light')
const runYesNoVote = require('./runYesNoVote')
const story = require('../../game/basics/story/story')
const runPoll = require('./runPoll')

module.exports = async ({ msg, guild, otherShip }) => {
  log(msg, 'Attack Ship', msg.guild.name)
  if (!otherShip) return

  // ---------- don't attack twice in one tick
  if (!guild.ship.canAttack())
    return send(
      msg,
      story.attack.tooSoon(msToTimeString(guild.context.timeUntilNextTick())),
    )

  // ---------- check equipment
  if (!guild.ship.equipment.weapon || guild.ship.equipment.weapon.length === 0)
    return send(msg, story.attack.noWeapon())
  if (!guild.ship.equipment.weapon.find((w) => w.repair > 0))
    return send(msg, story.attack.brokenWeapons())

  // ---------- use vote caller stamina
  const authorCrewMemberObject = guild.ship.members.find(
    (m) => m.id === msg.author.id,
  )
  if (!authorCrewMemberObject) return console.log('no user found in attackShip')
  const staminaRes = authorCrewMemberObject.useStamina('poll')
  if (!staminaRes.ok) return send(msg, staminaRes.message)

  // ---------- vote on the attack
  // const attackVoteEmbed = new Discord.MessageEmbed().setColor(process.env.APP_COLOR).setTitle()
  guild.ship.logEntry(
    `${msg.author.nickname} started a vote to attack ${otherShip.name}.`,
  )
  const voteEmbed = new Discord.MessageEmbed().setColor(process.env.APP_COLOR)
  if (guild.ship.equipment.weapon.length === 1)
    voteEmbed.description = `Your \`${guild.ship.equipment.weapon[0].emoji} ${
      guild.ship.equipment.weapon[0].displayName
    }\` is estimated to have a \`${Math.round(
      guild.ship.equipment.weapon[0].hitPercent(
        distance(...guild.ship.location, ...otherShip.location),
      ) * 100,
    )}%\` base chance of hitting, but the munitions skill of voters in this poll, as well as the enemy's piloting skills, will have a large impact.
		
The \`${guild.ship.equipment.weapon[0].emoji} ${
      guild.ship.equipment.weapon[0].displayName
    }\` requires a cumulative voter munitions level of \`${
      guild.ship.equipment.weapon[0].requirements.munitions
    }\`.

Vote with more collective munitions skill, get closer, and repair your weapons to have a better shot!`

  const {
    ok,
    message,
    result,
    yesPercent,
    yesVoters,
    insufficientVotes,
    sentMessage: voteMessage,
  } = await runYesNoVote({
    pollType: 'attack',
    embed: voteEmbed,
    question: `Attack ${otherShip.name}? | Vote started by ${msg.author.nickname}`,
    minimumMemberPercent: 0.1,
    yesStaminaRequirement: 1,
    msg,
    ship: guild.ship,
    cleanUp: false,
  })
  if (!ok) return send(msg, message)

  console.log(yesVoters, insufficientVotes, ok, message)

  voteEmbed.fields = []
  if (insufficientVotes) {
    guild.ship.logEntry(story.vote.insufficientVotes())
    voteEmbed.description = story.vote.insufficientVotes()
    voteMessage.edit(voteEmbed)
    return
  }
  if (!result) {
    guild.ship.logEntry(story.attack.voteFailed())
    voteEmbed.description = story.attack.voteFailed()
    voteMessage.edit(voteEmbed)
    return
  }
  // vote passed
  const collectiveMunitionsSkill = yesVoters.reduce(
    (total, u) =>
      total +
      (guild.ship.members.find((m) => m.id === u.id)?.level?.munitions || 0),
    0,
  )
  guild.ship.logEntry(
    story.attack.votePassed(yesPercent, otherShip, collectiveMunitionsSkill),
  )
  voteEmbed.description = story.attack.votePassed(
    yesPercent,
    otherShip,
    collectiveMunitionsSkill,
  )
  voteMessage.edit(voteEmbed)

  // ---------- pick a weapon to use
  let weaponToUse
  if (guild.ship.equipment.weapon.length === 1)
    weaponToUse = guild.ship.equipment.weapon[0]
  else {
    // run a poll to see which weapon to use
    const weaponsAsReactionObjects = guild.ship.equipment.weapon.map(
      (w, index) => ({
        emoji: numberToEmoji(index),
        label: `${w.emoji} \`${w.displayName}\` - ${(w.repair * 100).toFixed(
          0,
        )}% repair`,
      }),
    )
    const { userReactions, sentMessage: pollMessage } = await runPoll({
      pollTitle: `Which weapon should we attack with?`,
      reactions: weaponsAsReactionObjects,
    })
    console.log(userReactions)
    // todo !
    weaponToUse = guild.ship.equipment.weapon[0]
  }

  // too much munitions skill required
  if ((weaponToUse.requirements?.munitions || 0) > collectiveMunitionsSkill) {
    voteEmbed.description = story.attack.tooLowMunitionsSkill(
      weaponToUse.requirements.munitions,
      collectiveMunitionsSkill,
      weaponToUse,
    )
    voteMessage.edit(voteEmbed)
    return
  }

  // ---------- get possible targets
  const targets = guild.ship.getTargetsOnOtherShip(otherShip)
  let sentMessage, resultEmbed
  // if there are no targets that your scanner can detect, then just go ahead and just attack anywhere
  if (!targets.length) {
    // ---------- do an attack
    const res = guild.ship.attackShip({
      enemyShip: otherShip,
      weapon: weaponToUse,
      collectiveMunitionsSkill,
    })
    sentMessage = (await send(msg, res.message))[0]
    resultEmbed = res.message
  }

  // ---------- pick a place to attack
  // todo
  // const embed = new Discord.MessageEmbed()
  //   .setColor(process.env.APP_COLOR)
  //   .setTitle('Visible Targets')
  //   .addFields(res.fields.map((f) => ({ inline: true, ...f })))

  // const sentMessage = (await send(msg, embed))[0]
  // if (res.message) send(msg, res.message)

  // ---------- do the attack

  // ---------- options from now
  const actions = guild.ship.getActionsOnOtherShip(otherShip)
  await awaitReaction({
    msg: sentMessage,
    reactions: actions,
    embed: resultEmbed,
    guild,
  })
}
