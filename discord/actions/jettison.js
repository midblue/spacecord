const send = require(`./send`)
const { log, canEdit } = require(`../botcommon`)
const { numberToEmoji } = require(`../../common`)
const awaitReaction = require(`./awaitReaction`)
const Discord = require(`discord.js-light`)
const runYesNoVote = require(`./runYesNoVote`)
const story = require(`../../game/basics/story/story`)

const cargoData = require(`../../game/basics/cargo`)

module.exports = async ({ msg, guild }) => {
  log(msg, `Jettison`, msg.guild?.name)

  // ---------- use vote caller stamina
  const authorCrewMemberObject = guild.ship.members.find(
    (m) => m.id === msg.author.id,
  )
  if (!authorCrewMemberObject) return console.log(`no user found in jettison`)
  const staminaRes = authorCrewMemberObject.useStamina(`poll`)
  if (!staminaRes.ok) return send(msg, staminaRes.message)

  const actualCargo = guild.ship.cargo.filter((c) => c.amount > 0.0001)
  if (guild.ship.credits) {
    actualCargo.push({
      type: `credits`,
      amount: guild.ship.credits,
      ...cargoData.credits,
    })
  }
  let cargoToJettison
  let amountToJettison = 0
  let messageToAttach

  const detailsEmbed = new Discord.MessageEmbed()
    .setColor(APP_COLOR)
    .setTitle(`Jettison Vote Details`)
    .setDescription(
      `Which cargo would you like to start a jettison vote about?`,
    )
  const sentMessage = (await send(msg, detailsEmbed))[0]

  const getAmountToJettison = async (sentMessage) => {
    if (await canEdit(sentMessage))
      sentMessage.reactions.removeAll().catch((e) => {})
    detailsEmbed.fields = []
    detailsEmbed.setDescription(
      `And how ${cargoToJettison.type === `credits` ? `many` : `much`} ${
        cargoToJettison.emoji
      }${cargoToJettison.displayName} would you like to jettison?`,
    )
    sentMessage.edit(detailsEmbed)

    const amountPossessed = cargoToJettison.amount
    const amountsAsReactions = []
    if (amountPossessed > 1) {
      amountsAsReactions.push({
        emoji: numberToEmoji(1),
        label: `1 ${cargoToJettison.type === `credits` ? `` : WEIGHT_UNIT}`,
        action: ({ msg, emoji, user }) => {
          amountToJettison = 1
          getMessageToAttach(msg)
        },
      })
    }

    if (amountPossessed > 10) {
      amountsAsReactions.push({
        emoji: numberToEmoji(2),
        label: `10 ${cargoToJettison.type === `credits` ? `` : WEIGHT_UNITS}`,
        action: ({ msg, emoji, user }) => {
          amountToJettison = 10
          getMessageToAttach(msg)
        },
      })
    }

    if (amountPossessed > 100) {
      amountsAsReactions.push({
        emoji: numberToEmoji(3),
        label: `100 ${cargoToJettison.type === `credits` ? `` : WEIGHT_UNITS}`,
        action: ({ msg, emoji, user }) => {
          amountToJettison = 100
          getMessageToAttach(msg)
        },
      })
    }

    if (amountPossessed > 1000) {
      amountsAsReactions.push({
        emoji: numberToEmoji(4),
        label: `1000 ${cargoToJettison.type === `credits` ? `` : WEIGHT_UNITS}`,
        action: ({ msg, emoji, user }) => {
          amountToJettison = 1000
          getMessageToAttach(msg)
        },
      })
    }

    amountsAsReactions.push({
      emoji: `🔥`,
      label: `All ${amountPossessed.toFixed(2)} ${WEIGHT_UNITS} of ${
        cargoToJettison.type === `credits` ? `them` : `it`
      }`,
      action: ({ msg, emoji, user }) => {
        amountToJettison = amountPossessed
        getMessageToAttach(msg)
      },
    })

    await awaitReaction({
      msg: sentMessage,
      reactions: amountsAsReactions,
      time: 60 * 1000,
      guild,
      embed: detailsEmbed,
    })

    if (await canEdit(sentMessage)) sentMessage.delete()
  }

  const getMessageToAttach = async (sentMessage) => {
    if (await canEdit(sentMessage))
      sentMessage.reactions.removeAll().catch((e) => {})
    detailsEmbed.fields = []
    detailsEmbed.setDescription(
      `Would you like to attach a message to your dropped ${cargoToJettison.emoji}${cargoToJettison.displayName}?`,
    )
    sentMessage.edit(detailsEmbed)

    const messageReactions = []
    messageReactions.push({
      emoji: `😶`,
      label: `No message`,
      action: ({ msg, emoji, user }) => {
        finalJettisonVote(msg)
      },
    })
    messageReactions.push({
      emoji: `🕊`,
      label: `"${story.jettison.message.peace()}"`,
      action: ({ msg, emoji, user }) => {
        messageToAttach = {
          emoji: `🕊`,
          message: story.jettison.message.peace(),
        }
        finalJettisonVote(msg)
      },
    })
    messageReactions.push({
      emoji: `🎁`,
      label: `"${story.jettison.message.forYou()}"`,
      action: ({ msg, emoji, user }) => {
        messageToAttach = {
          emoji: `🎁`,
          message: story.jettison.message.forYou(),
        }
        finalJettisonVote(msg)
      },
    })
    messageReactions.push({
      emoji: `⚖️`,
      label: `"${story.jettison.message.nowYou()}"`,
      action: ({ msg, emoji, user }) => {
        messageToAttach = {
          emoji: `⚖️`,
          message: story.jettison.message.nowYou(),
        }
        finalJettisonVote(msg)
      },
    })
    messageReactions.push({
      emoji: `🤡`,
      label: `"${story.jettison.message.gotcha()}"`,
      action: ({ msg, emoji, user }) => {
        messageToAttach = {
          emoji: `🤡`,
          message: story.jettison.message.gotcha(),
        }
        finalJettisonVote(msg)
      },
    })

    await awaitReaction({
      msg: sentMessage,
      reactions: messageReactions,
      time: 60 * 1000,
      guild,
      embed: detailsEmbed,
    })

    if (await canEdit(sentMessage)) sentMessage.delete()
  }

  const finalJettisonVote = async (sentMessage) => {
    if (await canEdit(sentMessage)) sentMessage.delete()

    detailsEmbed.setTitle(
      `Jettison ${amountToJettison.toFixed(2)} ${
        cargoToJettison.type === `credits` ? `` : WEIGHT_UNITS + ` of`
      } ${cargoToJettison.emoji}${
        cargoToJettison.displayName
      }? | Vote started by ${msg.author.nickname}`,
    )
    detailsEmbed.description = messageToAttach
      ? `Cache will have the attached message: "${messageToAttach.emoji} ${messageToAttach.message}"`
      : ``
    detailsEmbed.fields = []

    const voteResult = await runYesNoVote({
      pollType: `jettison`,
      embed: detailsEmbed,
      minimumMemberPercent: 0.1,
      msg,
      guild,
      cleanUp: false,
    })
    if (!voteResult.ok) return send(msg, voteResult.message)
    detailsEmbed.fields = []
    if (voteResult.insufficientVotes) {
      detailsEmbed.description = story.vote.insufficientVotes()
      voteResult.sentMessage.edit(detailsEmbed)
      return
    }
    if (!voteResult.result) {
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

    detailsEmbed.title = `Jettisoned ${amountToJettison.toFixed(2)} ${
      cargoToJettison.type === `credits` ? `` : WEIGHT_UNITS + ` of`
    } ${cargoToJettison.emoji}${cargoToJettison.displayName}.`

    detailsEmbed.description = story.jettison.votePassed(
      voteResult.yesPercent,
      cargoToJettison,
      amountToJettison,
    )
    voteResult.sentMessage.edit(detailsEmbed)
    guild.ship.jettison(cargoToJettison, amountToJettison, messageToAttach)
  }

  if (actualCargo.length === 0) return send(msg, `No cargo to jettison!`)
  if (actualCargo.length === 1) {
    cargoToJettison = actualCargo[0]
    getAmountToJettison(sentMessage)
  } else {
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
      time: 60 * 1000,
      guild,
      embed: detailsEmbed,
    })

    if (await canEdit(sentMessage)) sentMessage.delete()
  }
}
