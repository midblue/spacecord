const story = require('../../story/story')
const runYesNoVote = require('../../../../discord/actions/runYesNoVote')
const allTransceivers = require('../../equipment/transceiver/index')
const { msToTimeString } = require('../../../../common')

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

    if (timeUntilCanBroadcast === 0) {
      actions.push({
        emoji: '📍',
        label: `Broadcast your location (⚡️${broadcastEquipment.powerUse.broadcast} ${process.env.POWER_UNIT})`,
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

          const reallyDoIt = await runYesNoVote({
            question: `Really broadcast your ship's location? | Vote started by ${user.nickname}`,
            time: 10 * 1000,
            minimumMemberPercent: 0.1,
            msg,
            ship: guild.ship,
          })
          console.log(reallyDoIt)
          if (reallyDoIt.insufficientVotes) {
            guild.ship.logEntry(
              `A vote started by %username%${user.id}% to broadcast the ship's location failed with too few votes.`,
            )
            return guild.pushToGuild(story.vote.insufficientVotes(), msg)
          }
          if (reallyDoIt.result === true) {
            guild.ship.logEntry(
              `The ship's location was broadcast to anyone in range to hear it. %username%${user.id}% started the vote, and ${reallyDoIt.voters} members voted.`,
            )
            guild.ship.broadcast({
              msg,
              broadcastType: 'location',
              equipment: broadcastEquipment,
              yesPercent: reallyDoIt.yesPercent,
            })
          } else {
            guild.ship.logEntry(
              `A vote started by %username%${user.id}% to broadcast the ship's location failed. ${reallyDoIt.voters} members voted.`,
            )
            guild.pushToGuild(story.broadcast.voteFailed(), msg)
          }
        },
      })

      actions.push({
        emoji: guild.ship.faction.emoji,
        label: `Broadcast a rallying cry for ${guild.ship.faction.name} (⚡️${broadcastEquipment.powerUse.broadcast} ${process.env.POWER_UNIT})`,
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

          const reallyDoIt = await runYesNoVote({
            question: `Really broadcast a rallying cry for ${guild.ship.faction.emoji}${guild.ship.faction.name} to the area? | Vote started by ${user.nickname}`,
            time: 10 * 1000,
            minimumMemberPercent: 0.1,
            msg,
            ship: guild.ship,
          })
          if (reallyDoIt.insufficientVotes) {
            guild.ship.logEntry(
              `A vote started by ${user.nickname} to send a faction rallying cry failed with too few votes.`,
            )
            return guild.pushToGuild(story.vote.insufficientVotes(), msg)
          }
          if (reallyDoIt.result === true) {
            guild.ship.logEntry(
              `The ship sent out a faction rallying cry. ${user.nickname} started the vote, and ${reallyDoIt.voters} members voted.`,
            )
            guild.ship.broadcast({
              msg,
              broadcastType: 'factionRally',
              equipment: broadcastEquipment,
              yesPercent: reallyDoIt.yesPercent,
            })
          } else {
            guild.ship.logEntry(
              `A vote started by ${user.nickname} to send a faction rallying cry failed. ${reallyDoIt.voters} members voted.`,
            )
            guild.pushToGuild(story.broadcast.voteFailed(), msg)
          }
        },
      })

      actions.push({
        emoji: '🆘',
        label: `Broadcast a distress signal (⚡️${broadcastEquipment.powerUse.broadcast} ${process.env.POWER_UNIT})`,
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

          const reallyDoIt = await runYesNoVote({
            question: `Really broadcast a distress signal containing your ship's location? | Vote started by ${user.nickname}`,
            time: 10 * 1000,
            minimumMemberPercent: 0.1,
            msg,
            ship: guild.ship,
          })
          if (reallyDoIt.insufficientVotes) {
            guild.ship.logEntry(
              `A vote started by ${user.nickname} to send a distress signal failed with too few votes.`,
            )
            return guild.pushToGuild(story.vote.insufficientVotes(), msg)
          }
          if (reallyDoIt.result === true) {
            guild.ship.logEntry(
              `The ship sent out a distress signal to anyone in range to hear it. ${user.nickname} started the vote, and ${reallyDoIt.voters} members voted.`,
            )
            guild.ship.broadcast({
              msg,
              broadcastType: 'distress',
              equipment: broadcastEquipment,
              yesPercent: reallyDoIt.yesPercent,
            })
          } else {
            guild.ship.logEntry(
              `A vote started by ${user.nickname} to send a distress signal failed. ${reallyDoIt.voters} members voted.`,
            )
            guild.pushToGuild(story.broadcast.voteFailed(), msg)
          }
        },
      })

      actions.push({
        emoji: '🏴‍☠️',
        label: `Broadcast an attack signal (⚡️${broadcastEquipment.powerUse.message} ${process.env.POWER_UNIT})`,
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

          const reallyDoIt = await runYesNoVote({
            question: `Really broadcast an attack signal to the area? | Vote started by ${user.nickname}`,
            time: 10 * 1000,
            minimumMemberPercent: 0.1,
            msg,
            ship: guild.ship,
          })
          if (reallyDoIt.insufficientVotes) {
            guild.ship.logEntry(
              `A vote started by ${user.nickname} to send an attack signal failed with too few votes.`,
            )
            return guild.pushToGuild(story.vote.insufficientVotes(), msg)
          }
          if (reallyDoIt.result === true) {
            guild.ship.logEntry(
              `The ship sent out an attack signal. ${user.nickname} started the vote, and ${reallyDoIt.voters} members voted.`,
            )
            guild.ship.broadcast({
              msg,
              broadcastType: 'attack',
              equipment: broadcastEquipment,
              yesPercent: reallyDoIt.yesPercent,
              powerUseType: 'message',
            })
          } else {
            guild.ship.logEntry(
              `A vote started by ${user.nickname} to send an attack signal failed. ${reallyDoIt.voters} members voted.`,
            )
            guild.pushToGuild(story.broadcast.voteFailed(), msg)
          }
        },
      })

      actions.push({
        emoji: '🏳',
        label: `Broadcast a surrender signal (⚡️${broadcastEquipment.powerUse.broadcast} ${process.env.POWER_UNIT})`,
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

          const reallyDoIt = await runYesNoVote({
            question: `Really broadcast a surrender signal to the area? | Vote started by ${user.nickname}`,
            time: 10 * 1000,
            minimumMemberPercent: 0.1,
            msg,
            ship: guild.ship,
          })
          if (reallyDoIt.insufficientVotes) {
            guild.ship.logEntry(
              `A vote started by ${user.nickname} to send a surrender signal failed with too few votes.`,
            )
            return guild.pushToGuild(story.vote.insufficientVotes(), msg)
          }
          if (reallyDoIt.result === true) {
            guild.ship.logEntry(
              `The ship sent out a surrender signal. ${user.nickname} started the vote, and ${reallyDoIt.voters} members voted.`,
            )
            guild.ship.broadcast({
              msg,
              broadcastType: 'surrender',
              equipment: broadcastEquipment,
              yesPercent: reallyDoIt.yesPercent,
            })
          } else {
            guild.ship.logEntry(
              `A vote started by ${user.nickname} to send a surrender signal failed. ${reallyDoIt.voters} members voted.`,
            )
            guild.pushToGuild(story.broadcast.voteFailed(), msg)
          }
        },
      })
    }

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
