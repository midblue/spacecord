const send = require(`../actions/send`)
const { log, canEdit } = require(`../botcommon`)
const Discord = require(`discord.js-light`)
const awaitReactionCancelable = require(`../actions/awaitReactionCancelable`)
const { numberToEmoji } = require(`../../common`)

module.exports = {
  tag: `generatePower`,
  pm: true,
  documentation: {
    name: `generatepower`,
    value: `Hop on the treadmill to make some power for the ship!`,
    category: `ship`,
    emoji: `🔌`,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:generatepower)$`, `gi`).exec(
      content,
    )
  },
  async action({ msg, settings, authorCrewMemberObject, guild }) {
    log(msg, `Generate Power`, msg.guild?.name)

    // ---------- use stamina
    const member =
      authorCrewMemberObject ||
      guild.ship.members.find((m) => m.id === msg.author.id)
    if (!member) return console.log(`no user found in trainEng`)
    const staminaRequired = authorCrewMemberObject.staminaRequiredFor(
      `generatePower`,
    )
    const staminaRes = member.useStamina(staminaRequired)
    if (!staminaRes.ok) return

    // ------------ game

    const rotationsGiven = 2
    let rotationsLeft = rotationsGiven
    const gameWidth = 5

    const selectionPool = [
      `🧨`,
      `🧨`,
      `⚡️`,
      `💎`,
      `🔷`,
      `🔷`,
      `🔶`,
      `🔶`,
      `🔶`,
      `🔻`,
      `🔻`,
    ]
    const values = {
      '💎': 1,
      '⚡️': 0.8,
      '🔷': 0.4,
      '🔻': 0.3,
      '🔶': 0.2,
      '🧨': -1,
    }
    const getRandom = () =>
      selectionPool[Math.floor(Math.random() * selectionPool.length)]

    const numbers = []
    const currentLayout = []
    for (let i = 0; i < gameWidth; i++) {
      numbers.push(numberToEmoji(i + 1))
      const row = []
      for (let j = 0; j < gameWidth; j++) row.push(getRandom())
      currentLayout.push(row)
    }

    const pushDown = (column) => {
      for (let i = currentLayout.length - 1; i >= 0; i--)
        currentLayout[i][column] = currentLayout[i - 1]?.[column] || getRandom()
    }

    const printLayout = () =>
      `\`\`\`` +
      numbers.join(` `) +
      `\n` +
      currentLayout.map((r) => r.join(`|`)).join(`\n`) +
      `\`\`\``

    const updateEmbed = () => {
      embed.fields.find((f) => f.id === `layout`).value = printLayout()
      embed.fields.find((f) => f.id === `rots`).value = rotationsLeft
      sentMessage.edit(embed)
    }

    const endGame = async () => {
      cancelAwaitResponse()
      if (await canEdit(sentMessage)) sentMessage.delete()

      const matches = []
      for (let row of currentLayout) {
        let currentCombo = ``
        let currentChar
        for (let i of row) {
          if (currentChar === i) {
            currentCombo += i
          } else {
            // different
            if (currentCombo.length / 2 > 1) {
              matches.push(currentCombo)
            }
            currentChar = i
            currentCombo = i
          }
        }
        if (currentCombo.length / 2 > 1) matches.push(currentCombo)
      }

      for (let column in currentLayout[0]) {
        let currentCombo = ``
        let currentChar
        for (let row in currentLayout) {
          const i = currentLayout[row][column]
          if (currentChar === i) {
            currentCombo += i
          } else {
            // different
            if (currentCombo.length / 2 > 1) {
              matches.push(currentCombo)
            }
            currentChar = i
            currentCombo = i
          }
        }
        if (currentCombo.length / 2 > 1) matches.push(currentCombo)
      }

      const matchesWithValues = []
      let totalPowerGained = matches.reduce((total, curr) => {
        const type = curr.substring(0, 2)
        const value = values[type] || 0
        const length = curr.length / 2
        const newEnergy = value * ((length - 1) * (length - 1))
        matchesWithValues.push({ match: curr, value: newEnergy })
        return total + newEnergy
      }, 0)

      guild.ship.addPower(totalPowerGained)

      const endEmbed = new Discord.MessageEmbed()
        .setColor(APP_COLOR)
        .setTitle(`Generate Power | Result`)
        .setDescription(
          `${msg.author.nickname} generated \`⚡️${
            Math.round(totalPowerGained * 10) / 10
          }\` power!
The ship is now at \`⚡️${
            Math.round(guild.ship.power * 10) / 10
          }\` power (${Math.round(
            (guild.ship.power / guild.ship.maxPower()) * 100,
          )}% of max).

Your matches were: 
` +
            matchesWithValues
              .sort((a, b) => b.value - a.value)
              .map(({ match, value }) => `\`${match}\`(${value})`)
              .join(`, `) +
            `

The final layout was:` +
            `\`\`\`` +
            currentLayout.map((r) => r.join(`|`)).join(`\n`) +
            `\`\`\``,
        )

      const endMessage = (await send(msg, endEmbed))[0]
    }

    const embed = new Discord.MessageEmbed()
      .setColor(APP_COLOR)
      .setTitle(`Generate Power`)
      .setDescription(
        `The ship's power systems run on rapidly spinning reels of power-generating crystals.
Create as many rows or columns of 2 or more as you can in the reactor core to generate power!
Your control rods can push a column's crystals down 1 slot up to ${rotationsGiven} times.
Pick a column to push down, or press ✅ to finish.`,
      )

    embed.fields = [
      {
        name: `Current Layout`,
        value: printLayout(),
        id: `layout`,
        inline: true,
      },
      {
        name: `Control Rods Left`,
        value: rotationsLeft,
        inline: true,
        id: `rots`,
      },
      {
        name: `Energy Values`,
        value: Object.entries(values)
          .map(([k, v]) => `\`${k}: ${v}\``)
          .join(`, `),
      },
    ]

    const reactions = [
      ...numbers.map((n, index) => {
        return {
          emoji: n,
          action: () => {
            pushDown(index)
            rotationsLeft--
            if (rotationsLeft) updateEmbed()
            else endGame()
          },
        }
      }),
      {
        emoji: `✅`,
        action: () => {
          endGame()
        },
      },
    ]

    const sentMessage = (await send(msg, embed))[0]
    const {
      cancel: cancelAwaitResponse,
      awaitReaction,
    } = awaitReactionCancelable({
      msg: sentMessage,
      reactions,
      embed,
      guild,
      respondeeFilter: (user) => user.id === msg.author.id,
      listeningType: `column to push down`,
    })
  },
}
