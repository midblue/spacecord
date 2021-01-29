const send = require('../actions/send')
const awaitReaction = require('../actions/awaitReaction')
const { log } = require('../common')
const { status } = require('../../game/manager')
const Discord = require('discord.js')
const constants = require('../../game/basics/constants')

module.exports = {
  tag: 'ship',
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:ship)$`, 'gi').exec(content)
  },
  async action({ msg, settings, game }) {
    log(msg, 'Ship', msg.guild.name)

    const res = await game.status(msg.guild.id)
    if (res.ok) {
      const embed = new Discord.MessageEmbed()
        .setColor('#7B6FE5')
        .setTitle(`${res.ship.name} | Status Report`)
        .setDescription(`All systems normal.`)
        .addFields([
          {
            name: `Ship Model`,
            value: res.ship.modelDisplayName,
            inline: true,
          },
          {
            name: `Fuel`,
            value: res.ship.cargo.find((c) => c.type === 'fuel').amount,
            inline: true,
          },
          {
            name: `Crew Members`,
            value: res.members.length,
            inline: true,
          },
          {
            name: `Ship Age`,
            value:
              (
                (Date.now() - res.ship.launched) *
                constants.REAL_TIME_TO_GAME_TIME_MULTIPLIER
              ).toFixed(2) + ' years',
            inline: true,
          },
          ,
        ])

      const sentMessages = await send(msg, embed)
      const lastMessage = sentMessages[sentMessages.length - 1]
      await awaitReaction(
        lastMessage,
        {
          '🚀': {
            label: 'Take Off',
            action() {
              send(msg, 'Take Off')
            },
          },
          '🪐': {
            label: 'Interact With Planet',
            action() {
              send(msg, 'Interact with Planet')
            },
          },
          '🎛': {
            label: 'Ship Controls',
            action() {
              send(msg, 'Ship Controls')
            },
          },
          '📡': {
            label: 'Scan Area',
            action() {
              send(msg, 'Scan Area')
            },
          },
          '☀️': {
            label: 'Fly Directly Into Sun',
            action() {
              send(msg, 'Fly into sun')
            },
          },
        },
        embed,
      )
    } else send(msg, res.message)
  },
}
