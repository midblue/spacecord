const story = require('../../story/story')
const runYesNoVote = require('../../../../discord/actions/runYesNoVote')
const allTransceivers = require('../../equipment/transceiver/index')
const { msToTimeString, usageTag } = require('../../../../common')
const staminaRequirements = require('../../crew/staminaRequirements')

module.exports = (guild) => {
  guild.ship.broadcastOptions = () => {
    const fields = [],
      actions = []

    const broadcastEquipment =
      allTransceivers[guild.ship.equipment.transceiver[0].id]

    let timeUntilCanBroadcast =
      (guild.lastBroadcast?.time || 0) +
      broadcastEquipment.repeatUseTimeLimit -
      Date.now()
    if (timeUntilCanBroadcast < 0) timeUntilCanBroadcast = 0

    fields.push(
      ...[
        {
          name: 'Transceiver',
          value:
            broadcastEquipment.emoji +
            ' ' +
            broadcastEquipment.modelDisplayName,
        },
        {
          name: '📶 Range',
          value: broadcastEquipment.range + ' ' + process.env.DISTANCE_UNIT,
        },

        {
          name: '🔋 Transceiver Status',
          value:
            timeUntilCanBroadcast > 0
              ? `Recharged in ${msToTimeString(timeUntilCanBroadcast)}`
              : 'Charged and ready!',
        },

        {
          name: '⚡️Ship Power',
          value: guild.ship.power.toFixed(1) + process.env.POWER_UNIT,
        },
      ],
    )

    const baseBroadcastOptions = [
      {
        type: 'location',
        emoji: '📍',
        label: `Broadcast your location`,
        yesNoQuestion: (user) =>
          `Really broadcast your ship's location? | Vote started by ${user.nickname}`,
        insufficientLog: (user) =>
          `A vote started by %username%${user.id}% to broadcast the ship's location failed with too few votes.`,
        successLog: (user, reallyDoIt) =>
          `The ship's location was broadcast to anyone in range to hear it. %username%${user.id}% started the vote, and ${reallyDoIt.voters} members voted.`,
        failureLog: (user, reallyDoIt) =>
          `A vote started by %username%${user.id}% to broadcast the ship's location failed. ${reallyDoIt.voters} members voted.`,
      },
      {
        type: 'factionRally',
        emoji: guild.ship.faction.emoji,
        label: `Broadcast a rallying cry for ${guild.ship.faction.name}`,
        yesNoQuestion: (user) =>
          `Really broadcast a rallying cry for ${guild.ship.faction.emoji}${guild.ship.faction.name} to the area? | Vote started by ${user.nickname}`,
        insufficientLog: (user) =>
          `A vote started by ${user.nickname} to send a faction rallying cry failed with too few votes.`,
        successLog: (user, reallyDoIt) =>
          `The ship sent out a faction rallying cry. ${user.nickname} started the vote, and ${reallyDoIt.voters} members voted.`,
        failureLog: (user, reallyDoIt) =>
          `A vote started by ${user.nickname} to send a faction rallying cry failed. ${reallyDoIt.voters} members voted.`,
      },
      {
        type: 'distress',
        emoji: '🆘',
        label: `Broadcast a distress signal`,
        yesNoQuestion: (user) =>
          `Really broadcast a distress signal containing your ship's location? | Vote started by ${user.nickname}`,
        insufficientLog: (user) =>
          `A vote started by ${user.nickname} to send a distress signal failed with too few votes.`,
        successLog: (user, reallyDoIt) =>
          `The ship sent out a distress signal to anyone in range to hear it. ${user.nickname} started the vote, and ${reallyDoIt.voters} members voted.`,
        failureLog: (user, reallyDoIt) =>
          `A vote started by ${user.nickname} to send a distress signal failed. ${reallyDoIt.voters} members voted.`,
      },
      {
        type: 'attack',
        emoji: '🏴‍☠️',
        label: `Broadcast an attack signal`,
        yesNoQuestion: (user) =>
          `Really broadcast an attack signal to the area? | Vote started by ${user.nickname}`,
        insufficientLog: (user) =>
          `A vote started by ${user.nickname} to send an attack signal failed with too few votes.`,
        successLog: (user, reallyDoIt) =>
          `The ship sent out an attack signal. ${user.nickname} started the vote, and ${reallyDoIt.voters} members voted.`,
        failureLog: (user, reallyDoIt) =>
          `A vote started by ${user.nickname} to send an attack signal failed. ${reallyDoIt.voters} members voted.`,
      },
      {
        type: 'surrender',
        emoji: '🏳',
        label: `Broadcast a surrender signal`,
        yesNoQuestion: (user) =>
          `Really broadcast a surrender signal to the area? | Vote started by ${user.nickname}`,
        insufficientLog: (user) =>
          `A vote started by ${user.nickname} to send a surrender signal failed with too few votes.`,
        successLog: (user, reallyDoIt) =>
          `The ship sent out a surrender signal. ${user.nickname} started the vote, and ${reallyDoIt.voters} members voted.`,
        failureLog: (user, reallyDoIt) =>
          `A vote started by ${user.nickname} to send a surrender signal failed. ${reallyDoIt.voters} members voted.`,
      },
    ]

    baseBroadcastOptions.forEach((o) => {
      if ((broadcastEquipment.capabilities || []).includes(o.type))
        actions.push({
          emoji: o.emoji,
          label:
            o.label +
            ' ' +
            usageTag(
              broadcastEquipment.powerUse,
              staminaRequirements['broadcast'],
            ),
          async action({ user, msg }) {
            if (
              (guild.lastBroadcast?.time || 0) +
                broadcastEquipment.repeatUseTimeLimit >
              Date.now()
            )
              return guild.pushToGuild(
                story.broadcast.tooSoon(broadcastEquipment.modelDisplayName),
                msg,
              )

            // ---------- use stamina
            const authorCrewMemberObject = guild.ship.members.find(
              (m) => m.id === user.id,
            )
            if (!authorCrewMemberObject)
              return console.log('no user found in broadcast')
            const staminaRes = authorCrewMemberObject.useStamina('broadcast')
            if (!staminaRes.ok)
              return guild.pushToGuild(staminaRes.message, msg)

            const reallyDoIt = await runYesNoVote({
              pollType: 'broadcast',
              question: o.yesNoQuestion(user),
              minimumMemberPercent: o.minimumMemberPercent || 0.1,
              msg,
              ship: guild.ship,
            })
            if (!reallyDoIt.ok)
              return guild.pushToGuild(reallyDoIt.message, msg)
            if (reallyDoIt.insufficientVotes) {
              guild.ship.logEntry(o.insufficientLog(user))
              return guild.pushToGuild(story.vote.insufficientVotes(), msg)
            }
            if (reallyDoIt.result === true) {
              guild.ship.logEntry(o.successLog(user, reallyDoIt))
              guild.ship.broadcast({
                msg,
                broadcastType: o.type,
                equipment: broadcastEquipment,
                yesPercent: reallyDoIt.yesPercent,
              })
            } else {
              guild.ship.logEntry(o.failureLog(user, reallyDoIt))
              guild.pushToGuild(story.broadcast.voteFailed(), msg)
            }
          },
        })
    })

    return { ok: true, fields, actions, range: broadcastEquipment.range }
  }

  // -------- actual broadcast action ----------

  guild.ship.broadcast = ({
    msg,
    broadcastType,
    powerUseType = 'broadcast',
    equipment,
    yesPercent,
  }) => {
    const powerRes = guild.ship.usePower(equipment.powerUse[powerUseType])
    if (!powerRes.ok) return guild.pushToGuild(powerRes.message, msg)

    guild.context.broadcast({
      x: guild.ship.location[0],
      y: guild.ship.location[1],
      range: equipment.range,
      excludeIds: guild.guildId,
      message: story.broadcast[broadcastType].receive(guild.ship),
      logMessage: story.broadcast[broadcastType].receiveLog
        ? story.broadcast[broadcastType].receiveLog(guild.ship)
        : story.broadcast[broadcastType].receive(guild.ship),
    })
    guild.lastBroadcast = { time: Date.now() }
    guild.saveNewDataToDb()

    return guild.pushToGuild(
      story.broadcast[broadcastType].send({
        ship: guild.ship,
        equipment,
        powerUse: equipment.powerUse[powerUseType],
        yesPercent,
      }),
      msg,
    )
  }
}
