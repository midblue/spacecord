const send = require('./send')
const { log } = require('../botcommon')
const {
  numberToEmoji,
  emojiToNumber,
  capitalize,
  msToTimeString,
  distance,
} = require('../../common')
const awaitReaction = require('./awaitReaction')
const Discord = require('discord.js-light')
const runYesNoVote = require('./runYesNoVote')
const story = require('../../game/basics/story/story')
const runPoll = require('./runPoll')
const cargoData = require('../../game/basics/cargo')

module.exports = async ({ msg, guild }) => {
  log(msg, 'Jettison', msg.guild.name)

  // ---------- use vote caller stamina
  const authorCrewMemberObject = guild.ship.members.find(
    (m) => m.id === msg.author.id,
  )
  if (!authorCrewMemberObject) return console.log('no user found in jettison')
  const staminaRes = authorCrewMemberObject.useStamina('poll')
  if (!staminaRes.ok) return send(msg, staminaRes.message)

  const actualCargo = guild.ship.cargo.filter((c) => c.amount > 0.0001)
  if (guild.ship.credits)
    actualCargo.push({
      type: 'credits',
      amount: guild.ship.credits,
      ...cargoData['credits'],
    })
  let cargoToJettison
  let amountToJettison = 0

  const detailsEmbed = new Discord.MessageEmbed()
    .setColor(process.env.APP_COLOR)
    .setTitle(`Jettison Vote Details`)
    .setDescription(
      `Which cargo would you like to start a jettison vote about?`,
    )
  const sentMessage = (await send(msg, detailsEmbed))[0]

  const getAmountToJettison = async (sentMessage) => {
    sentMessage.reactions.removeAll().catch((e) => {})
    detailsEmbed.fields = []
    detailsEmbed.setDescription(
      `And how ${cargoToJettison.type === 'credits' ? 'many' : 'much'} ${
        cargoToJettison.emoji
      }${
        cargoToJettison.displayName
      } would you like to jettison? (This will start a crew vote)`,
    )
    sentMessage.edit(detailsEmbed)

    const amountPossessed = cargoToJettison.amount
    const amountsAsReactions = []
    if (amountPossessed > 1)
      amountsAsReactions.push({
        emoji: numberToEmoji(1),
        label: `1 ${
          cargoToJettison.type === 'credits' ? '' : process.env.WEIGHT_UNIT
        }`,
        action: ({ msg, emoji, user }) => {
          amountToJettison = 1
          finalJettisonVote(msg)
        },
      })

    if (amountPossessed > 10)
      amountsAsReactions.push({
        emoji: numberToEmoji(2),
        label: `10 ${
          cargoToJettison.type === 'credits'
            ? ''
            : process.env.WEIGHT_UNIT_PLURAL
        }`,
        action: ({ msg, emoji, user }) => {
          amountToJettison = 10
          finalJettisonVote(msg)
        },
      })

    if (amountPossessed > 100)
      amountsAsReactions.push({
        emoji: numberToEmoji(3),
        label: `1 ${
          cargoToJettison.type === 'credits'
            ? ''
            : process.env.WEIGHT_UNIT_PLURAL
        }`,
        action: ({ msg, emoji, user }) => {
          amountToJettison = 100
          finalJettisonVote(msg)
        },
      })

    if (amountPossessed > 1000)
      amountsAsReactions.push({
        emoji: numberToEmoji(4),
        label: `1 ${
          cargoToJettison.type === 'credits'
            ? ''
            : process.env.WEIGHT_UNIT_PLURAL
        }`,
        action: ({ msg, emoji, user }) => {
          amountToJettison = 1000
          finalJettisonVote(msg)
        },
      })

    amountsAsReactions.push({
      emoji: '🔥',
      label: `All ${amountPossessed.toFixed(2)} ${
        process.env.WEIGHT_UNIT_PLURAL
      } of ${cargoToJettison.type === 'credits' ? 'them' : 'it'}`,
      action: ({ msg, emoji, user }) => {
        amountToJettison = amountPossessed
        finalJettisonVote(msg)
      },
    })

    await awaitReaction({
      msg: sentMessage,
      reactions: amountsAsReactions,
      time: 30 * 1000,
      guild,
      embed: detailsEmbed,
    })

    if (!sentMessage.deleted) sentMessage.delete()
  }

  const finalJettisonVote = async (sentMessage) => {
    sentMessage.delete()

    detailsEmbed.setTitle(
      `Jettison ${amountToJettison.toFixed(2)} ${
        cargoToJettison.type === 'credits'
          ? ''
          : process.env.WEIGHT_UNIT_PLURAL + ' of'
      } ${cargoToJettison.emoji}${
        cargoToJettison.displayName
      }? | Vote started by ${msg.author.nickname}`,
    )
    detailsEmbed.description = ''
    detailsEmbed.fields = []

    const voteResult = await runYesNoVote({
      pollType: 'jettison',
      embed: detailsEmbed,
      minimumMemberPercent: 0.1,
      msg,
      ship: guild.ship,
      cleanUp: false,
    })
    if (!voteResult.ok) return send(msg, voteResult.message)
    detailsEmbed.fields = []
    if (voteResult.insufficientVotes) {
      guild.ship.logEntry(story.vote.insufficientVotes())
      detailsEmbed.description = story.vote.insufficientVotes()
      voteResult.sentMessage.edit(detailsEmbed)
      return
    }
    if (!voteResult.result) {
      guild.ship.logEntry(story.attack.voteFailed())
      detailsEmbed.description = story.attack.voteFailed()
      voteResult.sentMessage.edit(detailsEmbed)
      return
    }

    // vote passed
    guild.ship.logEntry(
      story.jettison.votePassed(
        voteResult.yesPercent,
        cargoToJettison,
        amountToJettison,
      ),
    )
    detailsEmbed.description = story.jettison.votePassed(
      voteResult.yesPercent,
      cargoToJettison,
      amountToJettison,
    )
    voteResult.sentMessage.edit(detailsEmbed)
    guild.ship.jettison(cargoToJettison, amountToJettison)
  }

  if (actualCargo.length === 0) return send(msg, `No cargo to jettison!`)
  if (actualCargo.length === 1) cargoToJettison = actualCargo[0].type
  else {
    const cargoAsReactions = actualCargo.map((c, index) => ({
      emoji: `${c.emoji}`,
      label: `${c.displayName}`,
      action: ({ msg, emoji }) => {
        cargoToJettison = actualCargo.find((c) => c.emoji === emoji)
        getAmountToJettison(msg)
      },
    }))

    await awaitReaction({
      msg: sentMessage,
      reactions: cargoAsReactions,
      time: 30 * 1000,
      guild,
      embed: detailsEmbed,
    })

    if (!sentMessage.deleted) sentMessage.delete()
  }
}
