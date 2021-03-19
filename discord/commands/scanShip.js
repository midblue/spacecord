const { log } = require(`../botcommon`)
const Discord = require(`discord.js-light`)

module.exports = {
  tag: `scanShip`,
  pm: true,
  documentation: false,
  async action({ msg, guild, otherShip, authorCrewMemberObject }) {
    log(msg, `Scan Ship`, msg.guild?.name)
    if (!otherShip) return

    // ---------- use stamina
    if (!authorCrewMemberObject) return console.log(`no user found in scanShip`)
    const staminaRes = authorCrewMemberObject.useStamina(`scanShip`)
    if (!staminaRes.ok) return

    const res = guild.ship.scanOtherShip(otherShip)
    if (!res.ok) return authorCrewMemberObject.message(res.message)

    const actions = guild.ship.getActionsOnOtherShip(otherShip)

    const embed = new Discord.MessageEmbed()
      .setColor(APP_COLOR)
      .setTitle(`Nearby Ship Details`)
      .addFields(res.fields.map((f) => ({ inline: true, ...f })))

    guild.message(embed, null, actions)
    if (msg.pm) authorCrewMemberObject.message(embed, actions)
    if (res.message) {
      guild.message(res.message)
      if (msg.pm) authorCrewMemberObject.message(res.message)
    }
  },
}
