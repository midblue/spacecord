const story = require('../../story/story')
const runYesNoVote = require('../../../../discord/actions/runYesNoVote')
const allTranscievers = require('../../equipment/transciever/index')

const broadcastTimeLimit = 30 * 60 * 1000 // 30 minutes

module.exports = (guild) => {
  guild.ship.broadcastOptions = () => {
    const fields = [],
      actions = []

    const broadcastEquipment =
      allTranscievers[guild.ship.equipment.transciever[0].id]

    fields.push(
      ...[
        {
          name: 'Transciever',
          value:
            broadcastEquipment.emoji +
            ' ' +
            broadcastEquipment.modelDisplayName,
        },
        {
          name: '📶 Broadcast Range',
          value: broadcastEquipment.range + ' ' + process.env.DISTANCE_UNIT,
        },
        {
          name: '⚡️Ship Power',
          value: guild.ship.power.toFixed(1) + process.env.POWER_UNIT,
        },
      ],
    )

    actions.push({
      emoji: '📍',
      label: `Broadcast your location (⚡️${broadcastEquipment.powerUse.broadcast} ${process.env.POWER_UNIT})`,
      async action({ user, msg }) {
        if ((guild.lastBroadcast?.time || 0) + broadcastTimeLimit > Date.now())
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
          guild.ship.broadcastLocation({
            msg,
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
      emoji: '🆘',
      label: `Broadcast a distress signal (⚡️${broadcastEquipment.powerUse.broadcast} ${process.env.POWER_UNIT})`,
      async action({ user, msg }) {
        if ((guild.lastBroadcast?.time || 0) + broadcastTimeLimit > Date.now())
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
          guild.ship.broadcastDistressSignal({
            msg,
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

    return { ok: true, fields, actions, range: broadcastEquipment.range }
  }

  guild.ship.broadcastLocation = ({ msg, equipment, yesPercent }) => {
    const powerRes = guild.ship.usePower(equipment.powerUse.broadcast)
    if (!powerRes.ok) return guild.pushToGuild(powerRes.message, msg)

    guild.context.broadcast({
      x: guild.ship.location[0],
      y: guild.ship.location[1],
      range: equipment.range,
      excludeIds: guild.guildId,
      message: story.broadcast.location.receive(guild.ship.location),
    })
    guild.lastBroadcast = { time: Date.now() }
    guild.saveNewDataToDb()

    return guild.pushToGuild(
      story.broadcast.location.send(
        equipment.modelDisplayName,
        equipment.range,
        equipment.powerUse.broadcast,
        yesPercent,
      ),
      msg,
    )
  }

  guild.ship.broadcastDistressSignal = ({ msg, equipment, yesPercent }) => {
    const powerRes = guild.ship.usePower(equipment.powerUse.broadcast)
    if (!powerRes.ok) return guild.pushToGuild(powerRes.message, msg)

    guild.context.broadcast({
      x: guild.ship.location[0],
      y: guild.ship.location[1],
      range: equipment.range,
      excludeIds: guild.guildId,
      message: story.broadcast.distress.receive(guild.ship.location),
    })
    guild.lastBroadcast = { time: Date.now() }
    guild.saveNewDataToDb()

    return guild.pushToGuild(
      story.broadcast.distress.send(
        equipment.modelDisplayName,
        equipment.range,
        equipment.powerUse.broadcast,
        yesPercent,
      ),
      msg,
    )
  }
}
