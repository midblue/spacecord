const story = require(`../../story/story`)
const runYesNoVote = require(`../../../../discord/actions/runYesNoVote`)
const allTransceivers = require(`../../equipment/transceiver`)
const { msToTimeString, usageTag } = require(`../../../../common`)
const staminaRequirements = require(`../../crew/staminaRequirements`)

module.exports = (guild) => {
  guild.ship.broadcastOptions = () => {
    const fields = []
    const actions = []

    const equipment = guild.ship.equipment.find(
      (e) => e.equipmentType === `transceiver`,
    ).list[0]

    let timeUntilCanBroadcast =
      (guild.lastBroadcast?.time || 0) +
      equipment.rechargeTime * TICK_INTERVAL -
      Date.now()
    if (timeUntilCanBroadcast < 0) timeUntilCanBroadcast = 0

    fields.push(
      ...[
        {
          name: `Transceiver`,
          value: equipment.emoji + ` ` + equipment.displayName,
        },
        {
          name: `🔧 Repair`,
          value: Math.round(equipment.repair * 100) + `%`,
        },
        {
          name: `📶 Max Range`,
          value: equipment.range * equipment.repair + ` ` + DISTANCE_UNIT,
        },

        {
          name: `🔋 Transceiver Status`,
          value:
            timeUntilCanBroadcast > 0
              ? `Recharged in ${msToTimeString(timeUntilCanBroadcast)}`
              : `Charged and ready!`,
        },

        {
          name: `⚡️Ship Power`,
          value: guild.ship.power.toFixed(1) + POWER_UNIT,
        },
      ],
    )

    const baseBroadcastOptions = [
      {
        type: `location`,
        emoji: `📍`,
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
        type: `faction`,
        emoji: guild.faction.emoji,
        label: `Rallying cry for ${guild.faction.emoji}${guild.faction.name}`,
        yesNoQuestion: (user) =>
          `Really broadcast a rallying cry for ${guild.faction.emoji}${guild.faction.name} to the area? | Vote started by ${user.nickname}`,
        insufficientLog: (user) =>
          `A vote started by ${user.nickname} to send a faction rallying cry failed with too few votes.`,
        successLog: (user, voterCount) =>
          `The ship sent out a faction rallying cry. ${user.nickname} started the vote, and ${voterCount} members voted.`,
        failureLog: (user, voterCount) =>
          `A vote started by ${user.nickname} to send a faction rallying cry failed. ${voterCount} members voted.`,
      },
      {
        type: `distress`,
        emoji: `🆘`,
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
        type: `attack`,
        emoji: `🏴‍☠️`,
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
        type: `surrender`,
        emoji: `🏳`,
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
      if (
        (equipment.broadcastCapabilities || []).includes(o.type) &&
        (o.type !== `faction` || guild.faction?.color)
      ) {
        actions.push({
          emoji: o.emoji,
          label:
            o.label +
            ` ` +
            usageTag(equipment.powerUse, staminaRequirements.broadcast),
          async action({ user, msg }) {
            if (
              (guild.lastBroadcast?.time || 0) +
                equipment.rechargeTime * TICK_INTERVAL >
              Date.now()
            ) {
              return guild.message(
                story.broadcast.tooSoon(equipment.displayName),
                msg,
              )
            }

            // ---------- use stamina
            const authorCrewMemberObject = guild.ship.members.find(
              (m) => m.id === user.id,
            )
            if (!authorCrewMemberObject) {
              return console.log(`no user found in broadcast`)
            }
            const staminaRes = authorCrewMemberObject.useStamina(`broadcast`)
            if (!staminaRes.ok) {
              return guild.message(staminaRes.message, msg)
            }

            const reallyDoIt = await runYesNoVote({
              pollType: `broadcast`,
              question: o.yesNoQuestion(user),
              description: `Broadcasts are amplified and clarified by the quality and repair of the ship's transceiver, as well as the combined \`engineering\` skills of \`✅ Yes\` voters.`, // \`linguistics\` and
              minimumMemberPercent: o.minimumMemberPercent || 0.1,
              yesStaminaRequirement: 1,
              msg,
              guild,
              cleanUp: false,
            })
            if (!reallyDoIt.ok) {
              return guild.message(reallyDoIt.message, msg)
            }
            if (reallyDoIt.insufficientVotes) {
              // guild.ship.logEntry(o.insufficientLog(user))
              return guild.message(story.vote.insufficientVotes(), msg)
            }
            if (reallyDoIt.result === true) {
              const collectiveSkill = reallyDoIt.yesVoters.reduce(
                (total, u) =>
                  total +
                  ((guild.ship.members.find((m) => m.id === u.id)?.level
                    ?.linguistics || 1) +
                    (guild.ship.members.find((m) => m.id === u.id)?.level
                      ?.engineering || 1)),
                0,
              )
              guild.ship.logEntry(
                o.successLog(user, reallyDoIt.voters.length, collectiveSkill),
              )
              const {
                biasedRange,
                garbleAmount,
                message,
              } = guild.ship.broadcast({
                msg,
                broadcastType: o.type,
                equipment: equipment,
                yesPercent: reallyDoIt.yesPercent,
                collectiveSkill,
              })
              const resultFields = [
                {
                  name: `Total Skill`,
                  value: collectiveSkill,
                  inline: true,
                },
                {
                  name: `Effective Range`,
                  value: biasedRange.toFixed(2) + ` ` + DISTANCE_UNIT,
                  inline: true,
                },
                {
                  name: `Message Garbling`,
                  value: `Between 0 and \`${Math.round(
                    garbleAmount * 100,
                  )}%\`\n(depending on range)`,
                  inline: true,
                },
              ]
              reallyDoIt.embed.title = `Broadcast Results`
              reallyDoIt.embed.description = message
              reallyDoIt.embed.fields = resultFields
              reallyDoIt.sentMessage.edit(reallyDoIt.embed).catch((e) => {
                console.trace()
                console.log(e)
              })
            } else {
              // guild.ship.logEntry(o.failureLog(user, reallyDoIt.voters.length))
              guild.message(story.broadcast.voteFailed(), msg)
            }
          },
        })
      }
    })

    return {
      ok: true,
      fields,
      actions,
      range: equipment.range,
    }
  }

  // -------- actual broadcast action ----------

  guild.ship.broadcast = ({
    msg,
    broadcastType,
    powerUseType = `broadcast`,
    equipment,
    yesPercent,
    collectiveSkill,
  }) => {
    const powerRes = guild.ship.usePower(equipment.powerUse)
    if (!powerRes.ok) {
      guild.message(powerRes.message, msg)
      return { ok: false, message: powerRes.message }
    }

    const durabilityRes = equipment.useDurability()
    if (!durabilityRes.ok) {
      guild.message(durabilityRes.message, msg)
      return { ok: false, message: durabilityRes.message }
    }

    let skillMod = 0.5
    skillMod += Math.min(1, collectiveSkill / 40) // .5 to 1.5
    const biasedRange = equipment.range * skillMod * equipment.repair
    const garbleAmount =
      equipment.maxGarble / (collectiveSkill / 4) + (1 - equipment.repair)

    receivedGuilds = guild.context.broadcast({
      x: guild.ship.location[0],
      y: guild.ship.location[1],
      range: biasedRange,
      excludeIds: guild.id,
      message: story.broadcast[broadcastType].receive,
      messageProps: [guild.ship],
      garbleAmount: garbleAmount,
    })
    guild.lastBroadcast = { time: Date.now() }
    guild.saveToDb()

    // durability loss
    equipment.useDurability()
    if (equipment.repair < 0) equipment.repair = 0

    const message = story.broadcast[broadcastType].send({
      ship: guild.ship,
      equipment,
      powerUse: equipment.powerUse,
      yesPercent,
      effectiveRange: biasedRange,
    })

    return {
      ok: true,
      biasedRange,
      garbleAmount,
      message,
      receivedGuilds,
    }
  }
}
