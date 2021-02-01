const auth = require('registry-auth-token')
const send = require('../actions/send')
const { log } = require('../botcommon')
const Discord = require('discord.js')
const { numberToEmoji, capitalize } = require('../../common')
const awaitReaction = require('../actions/awaitReaction')

module.exports = {
  tag: 'repair', // this is also the 'train' command
  documentation: {
    value: `Repair parts of the ship`,
    emoji: '🛠',
    priority: 50,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:repair|fix)$`, 'gi').exec(content)
  },
  async action({ msg, settings, guild, ship }) {
    log(msg, 'Repair', msg.guild.name)

    let allRepairableEquipment = []
    for (let [eqType, eqArr] of Object.entries(ship.equipment))
      allRepairableEquipment.push(...eqArr.map((e) => ({ ...e, type: eqType })))

    allRepairableEquipment = allRepairableEquipment
      .filter((e) => e.repair < 1)
      .slice(0, 10)
      .map((e, index) => ({ ...e, numberEmoji: numberToEmoji(index + 1) }))

    const sortedEquipment = allRepairableEquipment.sort(
      (a, b) => a.repair - b.repair,
    )
    const equipmentAsReactionOptions = sortedEquipment.map((e) => ({
      emoji: e.numberEmoji,
      label:
        `${e.emoji} \`${e.modelDisplayName}\` (${capitalize(e.type)}) - ${(
          e.repair * 100
        ).toFixed(0)}% repair` +
        (e.repairRequirements
          ? ` (Requires ${Object.entries(e.repairRequirements || {})
              .map(([type, num]) => `\`${num}\` in \`${type}\``)
              .join(' and ')})`
          : ''),
      requirements: e.repairRequirements,
      action() {
        console.log(e.modelDisplayName)
      },
    }))

    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`Which equipment would you like to repair?`)

    const sentMessages = await send(msg, embed)
    const lastMessage = sentMessages[sentMessages.length - 1]
    await awaitReaction({
      msg: lastMessage,
      reactions: equipmentAsReactionOptions,
      embed,
      guild,
    })
  },
}
