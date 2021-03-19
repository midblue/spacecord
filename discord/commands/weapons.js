const send = require(`../actions/send`)
const { log } = require(`../botcommon`)
const Discord = require(`discord.js-light`)
const awaitReaction = require(`../actions/awaitReaction`)
const runGuildCommand = require(`../actions/runGuildCommand`)

module.exports = {
  tag: `weapons`,
  pmOnly: true,
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:weapons?|w)$`, `gi`).exec(content)
  },
  async action({ msg, settings, ship, guild, authorCrewMemberObject }) {
    log(msg, `Equipment`, msg.guild?.name)

    const embed = new Discord.MessageEmbed()
      .setColor(APP_COLOR)
      .setTitle(`${guild.ship.name} | Weapons`)
      .setDescription(`Press a button for more details.`)

    const weaponData = guild.ship.weaponsInfo(`weapon`)

    embed.fields = weaponData.fields

    if (weaponData.actions.length === 0)
      return send(msg, `Your ship has no weapons equipped!`)
    if (weaponData.actions.length === 1)
      return runGuildCommand({
        msg,
        commandTag: `equipment`,
        props: { equipment: weaponData.actions[0].equipment },
      })

    authorCrewMemberObject.message(embed, weaponData.actions)
  },
}
