const send = require('../actions/send')
const { log } = require('../botcommon')
const Discord = require('discord.js')

module.exports = {
  tag: 'scanArea',
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:scan)$`, 'gi').exec(content)
  },
  async action({ msg, settings, client, ship }) {
    log(msg, 'Scan Area', msg.guild.name)

    const scanRes = await ship.scanArea()
    const timeUntilNextTick = client.game.timeUntilNextTick()

    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      // .setTitle(scanRes.message)
      .setDescription(
        '```Telemetry Unit: ' + scanRes.model + '\n' + scanRes.map + '```',
      )
      .addFields(
        {
          name: 'Key',
          value: scanRes.key.map((k) => '`' + k + '`').join(', '),
        },
        {
          name: 'Next update',
          value: `${Math.ceil(timeUntilNextTick / 1000 / 60)}m`,
          inline: true,
        },
        ...scanRes.data.map((d) => ({ ...d, inline: true })),
      )
    send(msg, embed)
  },
}