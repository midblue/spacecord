const send = require(`../actions/send`)
const { log, canEdit } = require(`../botcommon`)
const equipment = require(`../../game/basics/equipment/equipment`)
const Discord = require(`discord.js-light`)
const { capitalize, numberToEmoji, usageTag } = require(`../../common`)
const awaitReaction = require(`../actions/awaitReaction`)
const runGuildCommand = require(`../actions/runGuildCommand`)
const equipmentTypes = require(`../../game/basics/equipment/equipmentTypes`)
const buyEquipment = require(`../actions/buyEquipment`)
const sellEquipment = require(`../actions/sellEquipment`)

module.exports = {
  tag: `shipyard`,
  pm: true,
  documentation: {
    name: `shipyard`,
    value: `Buy and sell equipment for your ship.`,
    emoji: `🛠`,
    category: `planet`,
    priority: 30,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:shipyard)$`, `gi`).exec(content)
  },
  async action({ msg, guild, settings, game, buyOrSell, type, parts = [] }) {
    log(msg, `Shipyard`, msg.guild?.name)

    const planet = guild.context.planets.find(
      (p) => p.name === guild.ship.status.docked,
    )
    if (!planet) return send(msg, `Your ship isn't docked anywhere!`)

    if (!buyOrSell) {
      const embed = new Discord.MessageEmbed()
        .setTitle(`Shipyard`)
        .setDescription(`Would you like to buy or sell parts?`)

      const availableActions = [
        {
          emoji: `💸`,
          label: `Buy`,
          action: ({ user, msg, guild }) => {
            runGuildCommand({
              msg,
              commandTag: `shipyard`,
              props: { buyOrSell: `buy` },
            })
          },
        },
        {
          emoji: `💰`,
          label: `Sell`,
          action: ({ user, msg, guild }) => {
            runGuildCommand({
              msg,
              commandTag: `shipyard`,
              props: { buyOrSell: `sell` },
            })
          },
        },
      ]

      const sentMessage = (await send(msg, embed))[0]
      await awaitReaction({
        reactions: availableActions,
        msg: sentMessage,
        embed,
        guild,
      })
      if (await canEdit(sentMessage)) sentMessage.delete()
    } else if (buyOrSell === `buy` && !type) {
      let totalParts = 0
      const completeParts = {}
      Object.keys(planet.shipyard).forEach((type) => {
        planet.shipyard[type].forEach((part) => {
          const foundPart = equipment[type][part]
          if (foundPart) {
            if (!Array.isArray(completeParts[type])) completeParts[type] = []
            completeParts[type].push({ ...foundPart, type })
            totalParts++
          } else console.log(`No part found for`, type, part)
        })
      })

      const embed = new Discord.MessageEmbed()
        .setTitle(`Parts for Sale`)
        .setDescription(
          `Choose a category to see the parts for sale of that type.`,
        )

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
              commandTag: `shipyard`,
              props: { buyOrSell: `buy`, type, parts: completeParts[type] },
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
      if (await canEdit(sentMessage)) sentMessage.delete()
    }
    // otherwise, we already know what type to show
    else if (buyOrSell === `buy`) {
      parts.forEach(async (part, index) => {
        const cost = part.baseCost * planet.shipyardPriceMultiplier
        const tooExpensive = cost > guild.ship.credits
        let alreadyOwned = false
        if (equipmentTypes[type].singleton) {
          if (
            guild.ship.equipment
              ?.find((e) => e.equipmentType === type)
              .list.find((p) => p.id === part.id)
          ) {
            alreadyOwned = guild.ship.equipment
              ?.find((e) => e.equipmentType === type)
              .list.find((p) => p.id === part.id)
          }
        }

        const embed = new Discord.MessageEmbed()
          .setTitle(
            `${part.emoji} ${part.displayName} (${capitalize(
              type,
            )}) \`💳 ${cost} Credits\``,
          )
          .setDescription(
            `${alreadyOwned ? `_(Already Owned)_\n` : ``}` +
              `${
                tooExpensive
                  ? `_(Insufficient Credits! You need \`💳 ${
                      cost - guild.ship.credits
                    }\` more)_\n`
                  : ``
              }` +
              part.description,
          )

        const fields = guild.ship.getEquipmentData(part)
        embed.fields = fields.map((f) => ({ inline: true, ...f }))

        const availableActions = []
        if (!tooExpensive) {
          availableActions.push({
            emoji: `💰`,
            label:
              `Start a vote to buy this ${part.emoji} ${part.displayName} ` +
              usageTag(0, `poll`),
            action: ({ user, msg, guild }) => {
              buyEquipment({
                type,
                part,
                cost,
                msg: { ...msg, author: user },
                guild,
                willReplace: alreadyOwned,
              })
            },
          })
        }

        const sentMessage = (await send(msg, embed))[0]
        await awaitReaction({
          reactions: availableActions,
          msg: sentMessage,
          embed,
          guild,
        })
        if (await canEdit(sentMessage)) sentMessage.delete()
      })
    } else if (buyOrSell === `sell`) {
      const allSellableEquipment = []
      for (const [equipmentType, list] of guild.ship.equipment) {
        if (equipmentType !== `chassis`) allSellableEquipment.push(...list)
      }

      const sellableActions = allSellableEquipment.map((part, index) => {
        const cost = Math.round(
          part.baseCost *
            planet.shipyardPriceMultiplier *
            part.repair *
            planet.shipyardSellMultiplier,
        )
        return {
          emoji: numberToEmoji(index + 1),
          label: `${usageTag(0, 0, cost)} for ${part.emoji} \`${
            part.displayName
          }\` (${capitalize(part.type)}) - ${(part.repair * 100).toFixed(
            0,
          )}% repair`,
          action() {
            sellEquipment({ msg, part, cost, guild })
          },
        }
      })

      const embed = new Discord.MessageEmbed()
        .setColor(APP_COLOR)
        .setTitle(`Which equipment would you like to sell?`)

      const sentMessage = (await send(msg, embed))[0]
      await awaitReaction({
        msg: sentMessage,
        reactions: sellableActions,
        embed,
        guild,
      })
      sentMessage.delete()
    }
  },
}
