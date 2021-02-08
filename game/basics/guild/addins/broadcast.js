const story = require('../../story/story')
const runYesNoVote = require('../../../../discord/actions/runYesNoVote')
const allTransceivers = require('../../equipment/transceiver/index')
const { msToTimeString, usageTag } = require('../../../../common')
const staminaRequirements = require('../../crew/staminaRequirements')

module.exports = (guild) => {
  guild.ship.broadcastOptions = () => {
    const fields = [],
      actions = []

    const broadcastEquipment = guild.ship.equipment.transceiver[0]

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
          name: '🔧 Repair',
          value: Math.round(broadcastEquipment.repair * 100) + '%',
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
        label: `Your Location`,
        yesNoQuestion: (user) =>
          `Really broadcast your ship's location? | Vote started by ${user.nickname}`,
        insufficientLog: (user) =>
          `A vote started by %username%${user.id}% to broadcast the ship's location failed with too few votes.`,
        successLog: (user, voterCount) =>
          `The ship's location was broadcast to anyone in range to hear it. %username%${user.id}% started the vote, and ${voterCount} members voted.`,
        failureLog: (user, voterCount) =>
          `A vote started by %username%${user.id}% to broadcast the ship's location failed. ${voterCount} members voted.`,
      },
      {
        type: 'factionRally',
        emoji: guild.ship.faction.emoji,
        label: `Rallying cry for ${guild.ship.faction.emoji}${guild.ship.faction.name}`,
        yesNoQuestion: (user) =>
          `Really broadcast a rallying cry for ${guild.ship.faction.emoji}${guild.ship.faction.name} to the area? | Vote started by ${user.nickname}`,
        insufficientLog: (user) =>
          `A vote started by ${user.nickname} to send a faction rallying cry failed with too few votes.`,
        successLog: (user, voterCount) =>
          `The ship sent out a faction rallying cry. ${user.nickname} started the vote, and ${voterCount} members voted.`,
        failureLog: (user, voterCount) =>
          `A vote started by ${user.nickname} to send a faction rallying cry failed. ${voterCount} members voted.`,
      },
      {
        type: 'distress',
        emoji: '🆘',
        label: `Distress Signal`,
        yesNoQuestion: (user) =>
          `Really broadcast a distress signal containing your ship's location? | Vote started by ${user.nickname}`,
        insufficientLog: (user) =>
          `A vote started by ${user.nickname} to send a distress signal failed with too few votes.`,
        successLog: (user, voterCount) =>
          `The ship sent out a distress signal to anyone in range to hear it. ${user.nickname} started the vote, and ${voterCount} members voted.`,
        failureLog: (user, voterCount) =>
          `A vote started by ${user.nickname} to send a distress signal failed. ${voterCount} members voted.`,
      },
      {
        type: 'attack',
        emoji: '🏴‍☠️',
        label: `Declare Attack`,
        yesNoQuestion: (user) =>
          `Really broadcast an attack signal to the area? | Vote started by ${user.nickname}`,
        insufficientLog: (user) =>
          `A vote started by ${user.nickname} to send an attack signal failed with too few votes.`,
        successLog: (user, voterCount) =>
          `The ship sent out an attack signal. ${user.nickname} started the vote, and ${voterCount} members voted.`,
        failureLog: (user, voterCount) =>
          `A vote started by ${user.nickname} to send an attack signal failed. ${voterCount} members voted.`,
      },
      {
        type: 'surrender',
        emoji: '🏳',
        label: `Surrender Signal`,
        yesNoQuestion: (user) =>
          `Really broadcast a surrender signal to the area? | Vote started by ${user.nickname}`,
        insufficientLog: (user) =>
          `A vote started by ${user.nickname} to send a surrender signal failed with too few votes.`,
        successLog: (user, voterCount) =>
          `The ship sent out a surrender signal. ${user.nickname} started the vote, and ${voterCount} members voted.`,
        failureLog: (user, voterCount) =>
          `A vote started by ${user.nickname} to send a surrender signal failed. ${voterCount} members voted.`,
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
              description: `Broadcasts are amplified and clarified by the quality and repair of the ship's transceiver, as well as the combined  \`linguistics\` and \`engineering\` skills of \`✅ Yes\` voters.`,
              minimumMemberPercent: o.minimumMemberPercent || 0.1,
              yesStaminaRequirement: 1,
              msg,
              ship: guild.ship,
              cleanUp: false,
            })
            if (!reallyDoIt.ok)
              return guild.pushToGuild(reallyDoIt.message, msg)
            if (reallyDoIt.insufficientVotes) {
              guild.ship.logEntry(o.insufficientLog(user))
              return guild.pushToGuild(story.vote.insufficientVotes(), msg)
            }
            if (reallyDoIt.result === true) {
              const collectiveSkill = reallyDoIt.yesVoters.reduce(
                (total, u) =>
                  total +
                  ((guild.ship.members.find((m) => m.id === u.id)?.level
                    ?.linguistics || 0) +
                    (guild.ship.members.find((m) => m.id === u.id)?.level
                      ?.engineering || 0)),
                0,
              )
              guild.ship.logEntry(
                o.successLog(user, reallyDoIt.voters.length, collectiveSkill),
              )
              const {
                skillBiasedRange,
                garbleAmount,
                message,
              } = guild.ship.broadcast({
                msg,
                broadcastType: o.type,
                equipment: broadcastEquipment,
                yesPercent: reallyDoIt.yesPercent,
                collectiveSkill,
              })
              const resultFields = [
                {
                  name: 'Total Skill',
                  value: collectiveSkill,
                  inline: true,
                },
                {
                  name: 'Effective Range',
                  value:
                    skillBiasedRange.toFixed(2) +
                    ' ' +
                    process.env.DISTANCE_UNIT,
                  inline: true,
                },
                {
                  name: 'Message Garbling',
                  value: `Between 0 and \`${Math.round(
                    garbleAmount * 100,
                  )}%\`\n(depending on range)`,
                  inline: true,
                },
              ]
              reallyDoIt.embed.title = `Broadcast Results`
              reallyDoIt.embed.description = message
              reallyDoIt.embed.fields = resultFields
              reallyDoIt.sentMessage.edit(reallyDoIt.embed)
            } else {
              guild.ship.logEntry(o.failureLog(user, reallyDoIt.voters.length))
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
    collectiveSkill,
  }) => {
    const powerRes = guild.ship.usePower(equipment.powerUse)
    if (!powerRes.ok) return guild.pushToGuild(powerRes.message, msg)

    let skillMod = 0.5
    skillMod += Math.min(1, collectiveSkill / 40) // .5 to 1.5
    const skillBiasedRange = equipment.range * skillMod
    const garbleAmount = equipment.maxGarble / (collectiveSkill / 5)

    guild.context.broadcast({
      x: guild.ship.location[0],
      y: guild.ship.location[1],
      range: skillBiasedRange,
      excludeIds: guild.guildId,
      message: story.broadcast[broadcastType].receive,
      messageProps: [guild.ship],
      garbleAmount: garbleAmount,
    })
    guild.lastBroadcast = { time: Date.now() }
    guild.saveNewDataToDb()

    const message = story.broadcast[broadcastType].send({
      ship: guild.ship,
      equipment,
      powerUse: equipment.powerUse,
      yesPercent,
      effectiveRange: skillBiasedRange,
    })

    return {
      skillBiasedRange,
      garbleAmount,
      message,
    }
  }
}
