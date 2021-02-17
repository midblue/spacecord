const send = require(`../actions/send`)
const { log } = require(`../botcommon`)
const equipment = require(`../../game/basics/equipment/equipment`)
const Discord = require(`discord.js-light`)
const {
  capitalize,
  numberToEmoji,
  usageTag,
  percentToTextBars
} = require(`../../common`)
const awaitReaction = require(`../actions/awaitReaction`)
const runGuildCommand = require(`../actions/runGuildCommand`)
const equipmentTypes = require(`../../game/basics/equipment/equipmentTypes`)
const buyEquipment = require(`../actions/buyEquipment`)
const sellEquipment = require(`../actions/sellEquipment`)
const cargo = require(`../../game/basics/cargo`)
const buyCargo = require(`../actions/buyCargo`)
const sellCargo = require(`../actions/sellCargo`)

module.exports = {
  tag: `merchant`,
  documentation: {
    name: `merchant`,
    value: `Buy and sell cargo.`,
    emoji: `⚖️`,
    category: `planet`,
    priority: 20
  },
  test (content, settings) {
    return new RegExp(`^${settings.prefix}(?:merchants?)$`, `gi`).exec(content)
  },
  async action ({ msg, guild, buyOrSell, type, cost, amount }) {
    log(msg, `Merchant`, msg.guild.name)

    const planet = guild.context.planets.find(
      (p) => p.name === guild.ship.status.docked
    )
    if (!planet) return send(msg, `Your ship isn't docked anywhere!`)

    if (!buyOrSell) {
      const embed = new Discord.MessageEmbed()
        .setTitle(`Merchant Quarter`)
        .setDescription(`Would you like to buy or sell cargo?`)

      const availableActions = [
        {
          emoji: `💸`,
          label: `Buy`,
          action: ({ user, msg, guild }) => {
            runGuildCommand({
              msg,
              commandTag: `merchant`,
              props: { buyOrSell: `buy` }
            })
          }
        },
        {
          emoji: `💰`,
          label: `Sell`,
          action: ({ user, msg, guild }) => {
            runGuildCommand({
              msg,
              commandTag: `merchant`,
              props: { buyOrSell: `sell` }
            })
          }
        }
      ]

      const sentMessage = (await send(msg, embed))[0]
      await awaitReaction({
        reactions: availableActions,
        msg: sentMessage,
        embed,
        guild
      })
      if (!sentMessage.deleted) sentMessage.delete()
    } else if (buyOrSell === `buy` && !type) {
      const embed = new Discord.MessageEmbed()
        .setTitle(`Buy Goods`)
        .setDescription(`Choose a type to buy.`)

      const availableActions = []
      Object.keys(planet.merchant).forEach((type, index) => {
        if (!cargo[type]) return

        const cost = Math.round(
          cargo[type].baseCost * (planet.merchant[type] || 1)
        )

        availableActions.push({
          emoji: cargo[type].emoji,
          label: `${cargo[type].displayName} ${usageTag(
            0,
            0,
            cost
          )}/${WEIGHT_UNIT} (You have ${
            guild.ship.cargo.find((c) => c.type === type)?.amount || 0
          } ${WEIGHT_UNITS})`,
          action: ({ user, msg, guild }) => {
            runGuildCommand({
              msg,
              commandTag: `merchant`,
              props: {
                buyOrSell: `buy`,
                type,
                cost
              },
              guild
            })
          }
        })
      })

      const sentMessage = (await send(msg, embed))[0]
      await awaitReaction({
        reactions: availableActions,
        msg: sentMessage,
        embed,
        guild
      })
      if (!sentMessage.deleted) sentMessage.delete()
    } else if (buyOrSell === `buy`) {
      const embed = new Discord.MessageEmbed().setTitle(
        `Buy ${cargo[type].displayName} at ${usageTag(
          0,
          0,
          cost
        )}/${WEIGHT_UNIT}`
      )
      embed.fields = [
        {
          name: `💳 Credits`,
          value: `${guild.ship.credits}`,
          inline: true
        },
        {
          name: `🎒 Ship Weight`,
          value:
            percentToTextBars(
              guild.ship.getTotalWeight() /
                guild.ship.equipment.chassis[0].maxWeight
            ) +
            `\n` +
            Math.round(guild.ship.getTotalWeight()) +
            `/` +
            Math.round(guild.ship.equipment.chassis[0].maxWeight) +
            ` ` +
            WEIGHT_UNITS,
          inline: true
        }
      ]

      embed.setDescription(
        `How many ${cargo[type].emoji}${cargo[type].displayName} would you like to buy?`
      )

      const canBuy = Math.floor(guild.ship.credits / cost)
      const amountsAsReactions = []
      if (canBuy > 1) {
        amountsAsReactions.push({
          emoji: numberToEmoji(1),
          label: `1 ${WEIGHT_UNIT} ` + usageTag(0, `poll`),
          action: ({ msg, emoji, user }) => {
            buyCargo({
              msg,
              type,
              cost,
              amount: 1,
              guild
            })
          }
        })
      }

      if (canBuy > 10) {
        amountsAsReactions.push({
          emoji: numberToEmoji(2),
          label: `10 ${WEIGHT_UNITS} ` + usageTag(0, `poll`),
          action: ({ msg, emoji, user }) => {
            buyCargo({
              msg,
              type,
              cost,
              amount: 10,
              guild
            })
          }
        })
      }

      if (canBuy > 50) {
        amountsAsReactions.push({
          emoji: numberToEmoji(3),
          label: `50 ${WEIGHT_UNITS} ` + usageTag(0, `poll`),
          action: ({ msg, emoji, user }) => {
            buyCargo({
              msg,
              type,
              cost,
              amount: 50,
              guild
            })
          }
        })
      }

      if (canBuy > 100) {
        amountsAsReactions.push({
          emoji: numberToEmoji(4),
          label: `100 ${WEIGHT_UNITS} ` + usageTag(0, `poll`),
          action: ({ msg, emoji, user }) => {
            buyCargo({
              msg,
              type,
              cost,
              amount: 100,
              guild
            })
          }
        })
      }

      if (canBuy > 500) {
        amountsAsReactions.push({
          emoji: numberToEmoji(5),
          label: `500 ${WEIGHT_UNITS} ` + usageTag(0, `poll`),
          action: ({ msg, emoji, user }) => {
            buyCargo({
              msg,
              type,
              cost,
              amount: 500,
              guild
            })
          }
        })
      }

      if (canBuy > 1000) {
        amountsAsReactions.push({
          emoji: numberToEmoji(6),
          label: `1000 ${WEIGHT_UNITS} ` + usageTag(0, `poll`),
          action: ({ msg, emoji, user }) => {
            buyCargo({
              msg,
              type,
              cost,
              amount: 1000,
              guild
            })
          }
        })
      }

      if (canBuy > 0) {
        amountsAsReactions.push({
          emoji: `🔥`,
          label:
            `As many as possible (${canBuy} ${WEIGHT_UNITS}) ` +
            usageTag(0, `poll`),
          action: ({ msg, emoji, user }) => {
            buyCargo({
              msg,
              buyOrSell: `buy`,
              type,
              cost,
              amount: canBuy,
              guild
            })
          }
        })
      }

      const sentMessage = (await send(msg, embed))[0]
      await awaitReaction({
        reactions: amountsAsReactions,
        msg: sentMessage,
        embed,
        guild
      })
      if (!sentMessage.deleted) sentMessage.delete()
    } else if (buyOrSell === `sell` && !type) {
      const embed = new Discord.MessageEmbed()
        .setTitle(`Sell Goods`)
        .setDescription(`Choose a type to sell.`)

      const availableActions = []
      const notSold = []
      guild.ship.cargo.forEach((c, index) => {
        const { type, amount } = c

        if (!planet.merchant[type]) return notSold.push(type)

        const cost = Math.round(
          cargo[type].baseCost *
            planet.merchant[type] *
            (planet.merchantSellMultiplier || 1)
        )

        availableActions.push({
          emoji: cargo[type].emoji,
          label: `${cargo[type].displayName} ${usageTag(
            0,
            0,
            cost
          )}/${WEIGHT_UNIT} (You have ${
            guild.ship.cargo.find((c) => c.type === type)?.amount || 0
          } ${WEIGHT_UNITS})`,
          action: ({ user, msg, guild }) => {
            runGuildCommand({
              msg,
              commandTag: `merchant`,
              props: {
                buyOrSell: `sell`,
                type,
                cost
              },
              guild
            })
          }
        })
      })

      embed.description += `\n${notSold
        .map((type) => capitalize(type))
        .join(` and `)} can not be sold here.`

      const sentMessage = (await send(msg, embed))[0]
      await awaitReaction({
        reactions: availableActions,
        msg: sentMessage,
        embed,
        guild
      })
      if (!sentMessage.deleted) sentMessage.delete()
    } else if (buyOrSell === `sell`) {
      const embed = new Discord.MessageEmbed().setTitle(
        `Sell ${cargo[type].displayName} at ${usageTag(
          0,
          0,
          cost
        )}/${WEIGHT_UNIT}`
      )
      embed.fields = [
        {
          name: `💳 Credits`,
          value: `${guild.ship.credits}`,
          inline: true
        },
        {
          name: `🎒 Ship Weight`,
          value:
            percentToTextBars(
              guild.ship.getTotalWeight() /
                guild.ship.equipment.chassis[0].maxWeight
            ) +
            `\n` +
            Math.round(guild.ship.getTotalWeight()) +
            `/` +
            Math.round(guild.ship.equipment.chassis[0].maxWeight) +
            ` ` +
            WEIGHT_UNITS,
          inline: true
        }
      ]

      embed.setDescription(
        `How many ${cargo[type].emoji}${cargo[type].displayName} would you like to sell?`
      )

      const canSell = Math.floor(
        guild.ship.cargo.find((c) => c.type === type).amount
      )
      const amountsAsReactions = []
      if (canSell > 1) {
        amountsAsReactions.push({
          emoji: numberToEmoji(1),
          label: `1 ${WEIGHT_UNIT} ` + usageTag(0, `poll`),
          action: ({ msg, emoji, user }) => {
            sellCargo({
              msg,
              type,
              cost,
              amount: 1,
              guild
            })
          }
        })
      }

      if (canSell > 10) {
        amountsAsReactions.push({
          emoji: numberToEmoji(2),
          label: `10 ${WEIGHT_UNITS} ` + usageTag(0, `poll`),
          action: ({ msg, emoji, user }) => {
            sellCargo({
              msg,
              type,
              cost,
              amount: 10,
              guild
            })
          }
        })
      }

      if (canSell > 50) {
        amountsAsReactions.push({
          emoji: numberToEmoji(3),
          label: `50 ${WEIGHT_UNITS} ` + usageTag(0, `poll`),
          action: ({ msg, emoji, user }) => {
            sellCargo({
              msg,
              type,
              cost,
              amount: 50,
              guild
            })
          }
        })
      }

      if (canSell > 100) {
        amountsAsReactions.push({
          emoji: numberToEmoji(4),
          label: `100 ${WEIGHT_UNITS} ` + usageTag(0, `poll`),
          action: ({ msg, emoji, user }) => {
            sellCargo({
              msg,
              type,
              cost,
              amount: 100,
              guild
            })
          }
        })
      }

      if (canSell > 500) {
        amountsAsReactions.push({
          emoji: numberToEmoji(5),
          label: `500 ${WEIGHT_UNITS} ` + usageTag(0, `poll`),
          action: ({ msg, emoji, user }) => {
            sellCargo({
              msg,
              type,
              cost,
              amount: 500,
              guild
            })
          }
        })
      }

      if (canSell > 1000) {
        amountsAsReactions.push({
          emoji: numberToEmoji(6),
          label: `1000 ${WEIGHT_UNITS} ` + usageTag(0, `poll`),
          action: ({ msg, emoji, user }) => {
            sellCargo({
              msg,
              type,
              cost,
              amount: 1000,
              guild
            })
          }
        })
      }

      if (canSell > 0) {
        amountsAsReactions.push({
          emoji: `🔥`,
          label:
            `As many as possible (${canSell} ${WEIGHT_UNITS}) ` +
            usageTag(0, `poll`),
          action: ({ msg, emoji, user }) => {
            sellCargo({
              msg,
              buyOrSell: `buy`,
              type,
              cost,
              amount: canSell,
              guild
            })
          }
        })
      }

      const sentMessage = (await send(msg, embed))[0]
      await awaitReaction({
        reactions: amountsAsReactions,
        msg: sentMessage,
        embed,
        guild
      })
      if (!sentMessage.deleted) sentMessage.delete()
    }
  }
}
