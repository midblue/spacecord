const send = require('../actions/send')
const { log } = require('../botcommon')
const equipment = require('../../game/basics/equipment/equipment')
const Discord = require('discord.js-light')
const { capitalize, numberToEmoji, usageTag } = require('../../common')
const awaitReaction = require('../actions/awaitReaction')
const runGuildCommand = require('../actions/runGuildCommand')
const equipmentTypes = require('../../game/basics/equipment/equipmentTypes')
const buyEquipment = require('../actions/buyEquipment')

module.exports = {
  tag: 'shipyard',
  documentation: {
    name: 'shipyard',
    value: `Buy and sell equipment for your ship.`,
    emoji: '🛠',
    category: 'planet',
    priority: 30,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:shipyard)$`, 'gi').exec(content)
  },
  async action({ msg, guild, settings, game, type, parts = [] }) {
    log(msg, 'Shipyard', msg.guild.name)

    const planet = guild.context.planets.find(
      (p) => p.name === guild.ship.status.docked,
    )
    if (!planet) return send(msg, `Your ship isn't docked anywhere!`)

    if (!type) {
      let totalParts = 0
      const completeParts = {}
      Object.keys(planet.shipyard).forEach((type) => {
        planet.shipyard[type].forEach((part) => {
          let foundPart = equipment[type][part]
          if (foundPart) {
            if (!Array.isArray(completeParts[type])) completeParts[type] = []
            completeParts[type].push({ ...foundPart, type })
            totalParts++
          } else console.log('No part found for', type, part)
        })
      })

      const embed = new Discord.MessageEmbed()
        .setTitle(`Parts for Sale`)
        .setDescription(
          `Choose a category to see the parts for sale of that type.`,
        )
      // todo if totalParts is less than 3 or 4, just show em

      const availableActions = []
      Object.keys(completeParts).forEach((type, index) => {
        availableActions.push({
          emoji: numberToEmoji(index + 1),
          label: `**${capitalize(type)}** (${
            completeParts[type].length
          } for sale)`,
          action: ({ user, msg, guild }) => {
            runGuildCommand({
              msg,
              commandTag: 'shipyard',
              props: { type, parts: completeParts[type] },
            })
          },
        })
      })

      const sentMessage = (await send(msg, embed))[0]
      await awaitReaction({
        reactions: availableActions,
        msg: sentMessage,
        embed,
        guild,
      })
      if (!sentMessage.deleted) sentMessage.delete()
    }
    // otherwise, we already know what type to show
    else {
      parts.forEach(async (part, index) => {
        const cost = part.baseCost * planet.shipyardPriceMultiplier
        const tooExpensive = cost > guild.ship.credits
        let alreadyOwned = false
        if (equipmentTypes[type].singleton)
          if (guild.ship.equipment?.[type].find((p) => p.id === part.id))
            alreadyOwned = guild.ship.equipment?.[type].find(
              (p) => p.id === part.id,
            )

        const embed = new Discord.MessageEmbed()
          .setTitle(
            `${part.emoji} ${part.displayName} (${capitalize(
              type,
            )}) \`💳${cost} Credits\``,
          )
          .setDescription(
            `${alreadyOwned ? '_(Already Owned)_\n' : ''}` +
              `${
                tooExpensive
                  ? `_(Insufficient Credits! You need \`💳${
                      cost - guild.ship.credits
                    }\` more)_\n`
                  : ''
              }` +
              part.description,
          )

        const fields = guild.ship.getEquipmentData(part)
        embed.fields = fields.map((f) => ({ inline: true, ...f }))

        const availableActions = []
        if (!tooExpensive)
          availableActions.push({
            emoji: '💰',
            label:
              `Start a vote to buy this ${part.emoji} ${part.displayName} ` +
              usageTag(0, 'poll'),
            action: ({ user, msg, guild }) => {
              buyEquipment({
                msg,
                type,
                part,
                cost,
                msg: { ...msg, author: user },
                guild,
                willReplace: alreadyOwned,
              })
            },
          })

        const sentMessage = (await send(msg, embed))[0]
        await awaitReaction({
          reactions: availableActions,
          msg: sentMessage,
          embed,
          guild,
        })
        if (!sentMessage.deleted) sentMessage.delete()
      })
    }
  },
}
