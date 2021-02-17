const send = require('../actions/send')
const { log, username } = require('../botcommon')
const Discord = require('discord.js-light')
const awaitReaction = require('../actions/awaitReaction')
const { capitalize } = require('../../common')
const repair = require('./repair')

module.exports = {
  tag: 'equipment',
  documentation: {
    value: 'Stats on the ship\'s equipment.',
    emoji: '🔩',
    category: 'ship'
  },
  test (content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:equip|equipment|gear|items)$`,
      'gi'
    ).exec(content)
  },
  async action ({
    msg,
    settings,
    game,
    client,
    ship,
    guild,
    authorCrewMemberObject,
    equipment
  }) {
    log(msg, 'Equipment', msg.guild.name)

    if (!equipment) {
      const embed = new Discord.MessageEmbed()
        .setColor(APP_COLOR)
        .setTitle(`${guild.ship.name} | Equipment`)
        .setDescription('Which equipment would you like to see details on?')

      const equipmentActions = guild.ship.equipmentInfo().actions

      const sentMessage = (await send(msg, embed))[0]
      await awaitReaction({
        msg: sentMessage,
        reactions: equipmentActions,
        embed,
        guild
      })
    } else {
      const embed = new Discord.MessageEmbed()
        .setColor(APP_COLOR)
        .setTitle(
          `${equipment.emoji} ${equipment.displayName} (${capitalize(
            equipment.type
          )})`
        )
        .setDescription(
          (equipment.repair === 0 ? '**🚨 BROKEN DOWN 🚨**\n' : '') +
            (equipment.description || '')
        )

      const fields = guild.ship.getEquipmentData(equipment)
      embed.fields = fields.map((f) => ({ inline: true, ...f }))

      const availableActions = [
        {
          emoji: '🔧',
          action: ({ user, msg }) => {
            repair.action({ msg, settings, guild, ship, equipment })
          }
        }
      ]

      const sentMessage = (await send(msg, embed))[0]
      await awaitReaction({
        msg: sentMessage,
        reactions: availableActions,
        embed,
        guild
      })
    }
  }
}
