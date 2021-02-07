const send = require('../actions/send')
const { log } = require('../botcommon')
const {
  numberToEmoji,
  capitalize,
  msToTimeString,
  distance,
} = require('../../common')
const awaitReaction = require('../actions/awaitReaction')
const Discord = require('discord.js-light')
const runYesNoVote = require('../actions/runYesNoVote')
const story = require('../../game/basics/story/story')
const runPoll = require('../actions/runPoll')

module.exports = {
  tag: 'attackShip',
  documentation: false,
  async action({ msg, guild, otherShip }) {
    log(msg, 'Attack Ship', msg.guild.name)
    if (!otherShip) return

    // ---------- don't attack twice in one tick
    if (!guild.ship.canAttack())
      return send(
        msg,
        story.attack.tooSoon(msToTimeString(guild.context.timeUntilNextTick())),
      )

    // ---------- check equipment
    if (
      !guild.ship.equipment.weapon ||
      guild.ship.equipment.weapon.length === 0
    )
      return send(msg, story.attack.noWeapon())
    if (!guild.ship.equipment.weapon.find((w) => w.repair > 0))
      return send(msg, story.attack.brokenWeapons())

    // ---------- vote on the attack
    // const attackVoteEmbed = new Discord.MessageEmbed().setColor(process.env.APP_COLOR).setTitle()
    guild.ship.logEntry(
      `${msg.author.nickname} started a vote to attack ${otherShip.name}.`,
    )
    const voteEmbed = new Discord.MessageEmbed().setColor(process.env.APP_COLOR)
    if (guild.ship.equipment.weapon.length === 1)
      voteEmbed.description = `Your \`${guild.ship.equipment.weapon[0].emoji} ${
        guild.ship.equipment.weapon[0].modelDisplayName
      }\` is estimated to have a \`${Math.round(
        guild.ship.equipment.weapon[0].hitPercent(
          distance(...guild.ship.location, ...otherShip.location),
        ) * 100,
      )}%\` chance of hitting, but the skill of our munitions experts and their pilots will ultimately have an impact as well.
Get closer, repair your weapons, and train munitions to have a better shot!`
    const {
      result,
      yesPercent,
      insufficientVotes,
      voters,
      sentMessage: voteMessage,
    } = await runYesNoVote({
      embed: voteEmbed,
      question: `Attack ${otherShip.name}? | Vote started by ${msg.author.nickname}`,
      requirements: { munitions: 4 },
      minimumMemberPercent: 0.1,
      msg,
      ship: guild.ship,
      cleanUp: false,
    })
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
    guild.ship.logEntry(story.attack.votePassed(yesPercent, otherShip))
    voteEmbed.description = story.attack.votePassed(yesPercent, otherShip)
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
          label: `${w.emoji} \`${w.modelDisplayName}\` - ${(
            w.repair * 100
          ).toFixed(0)}% repair`,
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

    // ---------- get possible targets
    const targets = guild.ship.getTargetsOnOtherShip(otherShip)
    let sentMessage, resultEmbed
    // if there are no targets that your scanner can detect, then just go ahead and just attack anywhere
    if (!targets.length) {
      // ---------- do an attack
      const res = guild.ship.attackShip(otherShip, weaponToUse)
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
  },
}
