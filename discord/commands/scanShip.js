const send = require(`../actions/send`)
const { log } = require(`../botcommon`)
const { numberToEmoji, capitalize } = require(`../../common`)
const awaitReaction = require(`../actions/awaitReaction`)
const Discord = require(`discord.js-light`)

module.exports = {
  tag: `scanShip`,
  pm: true,
  documentation: false,
  async action({ msg, guild, otherShip }) {
    log(msg, `Scan Ship`, msg.guild?.name)
    if (!otherShip) return

    // ---------- use stamina
    const authorCrewMemberObject = guild.ship.members.find(
      (m) => m.id === msg.author.id,
    )
    if (!authorCrewMemberObject) return console.log(`no user found in scanShip`)
    const staminaRes = authorCrewMemberObject.useStamina(`scanShip`)
    if (!staminaRes.ok) return

    const res = guild.ship.scanOtherShip(otherShip)
    if (!res.ok) return send(msg, res.message)

    const actions = guild.ship.getActionsOnOtherShip(otherShip)

    const embed = new Discord.MessageEmbed()
      .setColor(APP_COLOR)
      .setTitle(`Nearby Ship Details`)
      .addFields(res.fields.map((f) => ({ inline: true, ...f })))

    const sentMessage = (await send(msg, embed))[0]
    if (res.message) send(msg, res.message)
    await awaitReaction({
      msg: sentMessage,
      reactions: actions,
      embed,
      guild,
    })
  },
}
