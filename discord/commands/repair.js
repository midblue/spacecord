const auth = require('registry-auth-token')
const send = require('../actions/send')
const { log } = require('../botcommon')
const Discord = require('discord.js')
const { numberToEmoji, capitalize } = require('../../common')
const awaitReaction = require('../actions/awaitReaction')

module.exports = {
  tag: 'repair', // this is also the 'train' command
  documentation: {
    value: `Repair parts of the ship.`,
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
      .sort((a, b) => a.repair - b.repair)
      .map((e, index) => ({
        ...e,
        numberEmoji: numberToEmoji(index + 1),
        index,
      }))

    const equipmentAsReactionOptions = allRepairableEquipment.map((e) => ({
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
        const res = guild.ship.repairEquipment({
          type: e.type,
          index: e.index,
          add: 1,
        }) // 1 = full repair
        send(msg, res.message)
      },
    }))

    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`Which equipment would you like to repair?`)

    const sentMessages = await send(msg, embed)
    const sentMessage = sentMessages[sentMessages.length - 1]
    await awaitReaction({
      msg: sentMessage,
      reactions: equipmentAsReactionOptions,
      embed,
      guild,
    })
    sentMessage.delete()
  },
}
