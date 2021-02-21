const send = require(`../actions/send`)
const { log, username } = require(`../botcommon`)
const Discord = require(`discord.js-light`)
const awaitReaction = require(`../actions/awaitReaction`)
const { capitalize } = require(`../../common`)
const repair = require(`./repair`)
const runGuildCommand = require(`../actions/runGuildCommand`)

module.exports = {
  tag: `weapons`,
  test (content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:weapons?|w)$`,
      `gi`
    ).exec(content)
  },
  async action ({
    msg,
    settings,
    ship,
    guild
  }) {
    log(msg, `Equipment`, msg.guild.name)

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
        props: { equipment: weaponData.actions[0].equipment }
      })

    const sentMessage = (await send(msg, embed))[0]
    await awaitReaction({
      msg: sentMessage,
      reactions: weaponData.actions,
      embed,
      guild
    })
  }
}
