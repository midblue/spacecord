const send = require(`../actions/send`)
const { log, canEdit } = require(`../botcommon`)
const Discord = require(`discord.js-light`)
const { numberToEmoji, capitalize, usageTag } = require(`../../common`)

module.exports = {
  tag: `repair`,
  pmOnly: true,
  documentation: {
    value: `Repair parts of the ship.`,
    emoji: `🛠`,
    category: `ship`,
    priority: 50,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:r|repair|fix)$`, `gi`).exec(
      content,
    )
  },
  async action({ msg, settings, guild, equipment, authorCrewMemberObject }) {
    log(msg, `Repair`, msg.guild?.name)

    if (!equipment) {
      let allRepairableEquipment = []
      for (let { equipmentType, list } of guild.ship.equipment)
        allRepairableEquipment.push(
          ...list.map((e, index) => ({ ...e, type: equipmentType, index })),
        )

      allRepairableEquipment = allRepairableEquipment
        .filter((e) => e.repair < 1)
        .slice(0, 10)
        .sort((a, b) => a.repair - b.repair)
        .map((e, index) => ({
          ...e,
          numberEmoji: numberToEmoji(index + 1),
        }))

      const equipmentAsReactionOptions = allRepairableEquipment.map((e) => ({
        emoji: e.numberEmoji,
        label:
          `${e.emoji} \`${e.displayName}\` (${capitalize(e.type)}) ${usageTag(
            0,
            guild.ship.repairStaminaCost(e),
          )} - ${(e.repair * 100).toFixed(0)}% repair` +
          (e.repairRequirements
            ? ` (Requires ${Object.entries(e.repairRequirements || {})
                .map(([type, num]) => `\`${num}\` in \`${type}\``)
                .join(` and `)})`
            : ``),
        requirements: e.repairRequirements,
        action() {
          const res = guild.ship.repairEquipment({
            type: e.type,
            index: e.index,
            add: 1,
          }) // 1 = full repair
          authorCrewMemberObject.message(res.message)
        },
      }))

      const embed = new Discord.MessageEmbed()
        .setColor(APP_COLOR)
        .setTitle(`Which equipment would you like to repair?`)

      if (!equipmentAsReactionOptions.length) {
        embed.setTitle(`Repair`).setDescription(`No equipment needs repairing!`)
      }

      authorCrewMemberObject.message(embed, equipmentAsReactionOptions)
    } else {
      // -------- use stamina
      const member =
        authorCrewMemberObject ||
        guild.ship.members.find((m) => m.id === msg.author.id)
      if (!member) return console.log(`no user found in repair`)
      const staminaRequired = guild.ship.repairStaminaCost(equipment)
      const staminaRes = member.useStamina(staminaRequired)
      if (!staminaRes.ok) return

      // --------- repair
      const res = guild.ship.repairEquipment({
        type: equipment.type,
        index: equipment.index,
        add: 1,
      }) // 1 = full repair
      authorCrewMemberObject.message(res.message)
    }
  },
}
