const send = require(`../actions/send`)
const { log, username } = require(`../botcommon`)
const Discord = require(`discord.js-light`)
const awaitReaction = require(`../actions/awaitReaction`)
const { capitalize } = require(`../../common`)
const repair = require(`./repair`)

module.exports = {
  tag: `equipment`,
  pmOnly: true,
  documentation: {
    value: `Stats on the ship's equipment.`,
    emoji: `🔩`,
    category: `ship`,
  },
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:equip|equipment|gear|items)$`,
      `gi`,
    ).exec(content)
  },
  async action({
    msg,
    settings,
    ship,
    guild,
    authorCrewMemberObject,
    equipment,
  }) {
    log(msg, `Equipment`, msg.guild?.name)

    if (!equipment) {
      const embed = new Discord.MessageEmbed()
        .setColor(APP_COLOR)
        .setTitle(`${guild.ship.name} | Equipment`)
        .setDescription(`Which equipment would you like to see details on?`)
      const equipmentActions = guild.ship.equipmentInfo().actions
      await authorCrewMemberObject.message(embed, equipmentActions)
    } else {
      const embed = new Discord.MessageEmbed()
        .setColor(APP_COLOR)
        .setTitle(
          `${equipment.emoji} ${equipment.displayName} (${capitalize(
            equipment.type,
          )})`,
        )
        .setDescription(
          (equipment.repair === 0 ? `**🚨 BROKEN DOWN 🚨**\n` : ``) +
            (equipment.description || ``),
        )

      const fields = guild.ship.getEquipmentData(equipment)
      embed.fields = fields.map((f) => ({ inline: true, ...f }))

      const availableActions = [
        {
          emoji: `🔧`,
          action: ({ user, msg }) => {
            repair.action({ msg, settings, guild, ship, equipment })
          },
        },
      ]
      await authorCrewMemberObject.message(embed, availableActions)
    }
  },
}
