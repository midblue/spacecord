const send = require(`./send`)
const { log } = require(`../botcommon`)
const {
  numberToEmoji,
  emojiToNumber,
  capitalize,
  msToTimeString,
  distance,
} = require(`../../common`)
const awaitReaction = require(`./awaitReaction`)
const Discord = require(`discord.js-light`)
const runYesNoVote = require(`./runYesNoVote`)
const story = require(`../../game/basics/story/story`)
const runPoll = require(`./runPoll`)
const { allSkills } = require(`../../game/gamecommon`)

module.exports = async ({ msg, guild, otherShip }) => {
  log(msg, `Attack Ship`, msg.guild.name)
  if (!otherShip || guild.status.docked) return

  // ---------- check equipment
  const weapons = guild.ship.equipment.find((e) => e.equipmentType === `weapon`)
    .list
  if (!weapons || weapons.length === 0) {
    return send(msg, story.attack.noWeapon())
  }
  if (!weapons.find((w) => w.repair > 0)) {
    return send(msg, story.attack.brokenWeapons())
  }

  // ---------- don't attack without a weapon off cooldown
  const usableWeapons = guild.ship.canAttack()
  if (!usableWeapons) {
    return send(
      msg,
      story.attack.tooSoon(msToTimeString(guild.ship.nextAttackInMs())),
    )
  }

  // ---------- use vote caller stamina
  const authorCrewMemberObject = guild.ship.members.find(
    (m) => m.id === msg.author.id,
  )
  if (!authorCrewMemberObject) return console.log(`no user found in attackShip`)
  const staminaRes = authorCrewMemberObject.useStamina(`poll`)
  if (!staminaRes.ok) return send(msg, staminaRes.message)

  // ---------- pick a weapon to use
  let weaponToUse
  if (usableWeapons.length === 1) weaponToUse = usableWeapons[0]
  else {
    // run a poll to see which weapon to use
    const weaponsAsReactionObjects = usableWeapons.map((w, index) => ({
      emoji: numberToEmoji(index + 1),
      label:
        `${w.emoji} \`${w.displayName}\` - ${(
          w.hitPercent(
            distance(...guild.ship.location, ...otherShip.location),
            otherShip,
          ) * 100
        ).toFixed(0)}% base hit chance` +
        (w.requirements?.munitions
          ? ` (Cumulative total of \`${
              allSkills.find((s) => s.name === `munitions`).emoji
            }${w.requirements.munitions}\` in munitions required from voters)`
          : ``),
    }))
    const { userReactions, sentMessage: pollMessage, winner } = await runPoll({
      msg,
      guild,
      pollTitle: `Which weapon should we attack with?`,
      reactions: weaponsAsReactionObjects,
    })
    if (!pollMessage.deleted) pollMessage.delete()
    if (!winner) return
    weaponToUse = usableWeapons[emojiToNumber(winner) - 1]
  }

  // ---------- vote on the attack
  const voteEmbed = new Discord.MessageEmbed().setColor(APP_COLOR)
  voteEmbed.description = `Your \`${usableWeapons[0].emoji} ${
    weaponToUse.displayName
  }\` is estimated to have a \`${Math.round(
    weaponToUse.hitPercent(
      distance(...guild.ship.location, ...otherShip.location),
      otherShip,
    ) * 100,
  )}%\` base chance of hitting, but the munitions skill of voters in this poll, as well as the enemy's piloting skills, will have a large impact.
		
${
  weaponToUse.requirements?.munitions
    ? `The \`${weaponToUse.emoji} ${
        weaponToUse.displayName
      }\` requires a cumulative voter munitions level of \`${
        allSkills.find((s) => s.name === `munitions`).emoji
      }${weaponToUse.requirements.munitions}\` to fire.

	`
    : ``
}Vote with more collective ${
    allSkills.find((s) => s.name === `munitions`).emoji
  }munitions skill, get closer, and repair your weapons to have a better shot!`

  const {
    ok,
    message,
    result,
    yesPercent,
    yesVoters,
    insufficientVotes,
    sentMessage: voteMessage,
  } = await runYesNoVote({
    pollType: `attack`,
    embed: voteEmbed,
    question: `Attack ${otherShip.name} with ${weaponToUse.emoji} ${weaponToUse.displayName}? | Vote started by ${msg.author.nickname}`,
    minimumMemberPercent: 0.1,
    yesStaminaRequirement: 1,
    msg,
    guild,
    cleanUp: false,
  })
  if (!ok) return send(msg, message)

  voteEmbed.fields = []
  if (insufficientVotes) {
    voteEmbed.description = story.vote.insufficientVotes()
    voteMessage.edit(voteEmbed)
    return
  }
  if (!result) {
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
  //   .setColor(APP_COLOR)
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
