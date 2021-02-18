const send = require(`../actions/send`)
const Discord = require(`discord.js-light`)
const { applyCustomParams } = require(`../botcommon`)
const { allSkills } = require(`../../game/gamecommon`)
const readyCheck = require(`../actions/readyCheck`)
const { msToTimeString } = require(`../../common`)
const awaitReaction = require(`../actions/awaitReaction`)

module.exports = ({ msg, user, guild }) => {
  return new Promise(async (resolve) => {
    const emoji = allSkills.find((s) => s.name === `munitions`).emoji

    // ------- generate general game variables
    let done = false
    const userLevel = user.level.munitions || 0
    const targetSizes = [2, 3, 4]
    const boardWidth = Math.max(
      4,
      Math.round(userLevel / 4),
      targetSizes.reduce((t, c) => Math.max(t, c), 0),
    )
    const shots =
      targetSizes.reduce((t, c) => t + c, 0) +
      Math.max(3, boardWidth - userLevel)
    let remainingShots = shots
    const time = shots * 15 * 1000
    let remainingTime = time
    let targetX = Math.floor((boardWidth - 1) / 2)
    let targetY = Math.floor((boardWidth - 1) / 2)

    // -------- build the board
    const board = []
    for (let i = 0; i < boardWidth; i++) {
      board.push([])
      for (let j = 0; j < boardWidth; j++) board[i].push(`◼️`)
    }
    targetSizes.forEach((targetSize) => {
      const findSpace = () => {
        const horiz = Math.random() > 0.5
        if (horiz) {
          const startX = Math.floor(Math.random() * (boardWidth - targetSize))
          const startY = Math.floor(Math.random() * boardWidth)
          for (let i = startX; i < startX + targetSize; i++) {
            if (board[startY][i] !== `◼️`) return false
          }
          for (let i = startX; i < startX + targetSize; i++) {
            board[startY][i] = `🚢`
          }
        } else {
          const startX = Math.floor(Math.random() * boardWidth)
          const startY = Math.floor(Math.random() * (boardWidth - targetSize))
          for (let i = startY; i < startY + targetSize; i++) {
            if (board[i][startX] !== `◼️`) return false
          }
          for (let i = startY; i < startY + targetSize; i++) {
            board[i][startX] = `🚢`
          }
        }
        return true
      }
      let found = false
      while (!found) found = findSpace()
    })

    // ------- make game embed
    const embed = new Discord.MessageEmbed()
      .setColor(APP_COLOR)
      .setTitle(`${emoji} Munitions Training | ${msg.author.nickname}`)
    embed.description = `it's battleship ya dummy`
    embed.fields = [
      { name: `🧨 Shots`, value: shots, inline: true },
      {
        name: `⏱ Time`,
        value: msToTimeString(remainingTime),
        inline: true,
      },
    ]

    // ------- wait for them to say I'm Ready
    const sentMessage = (await send(msg, embed))[0]
    const ready = await readyCheck({ msg: sentMessage, embed, user })
    if (!ready) {
      if (!sentMessage.deleted) sentMessage.delete()
      return
    }

    embed.fields = [
      {
        name: `Key`,
        value:
          `\`📍Current Target\`, \`💢Hit\`, \`✖️Miss\`, \`👍Current(Hit)\`, \`👎Current(Miss)\``,
      },
      {
        name: `🧨 Shots Remaining`,
        value: remainingShots,
        id: `remainingShots`,
        inline: true,
      },
      {
        name: `⏱ Time Remaining`,
        value: msToTimeString(remainingTime),
        id: `remainingTime`,
        inline: true,
      },
    ]
    await sentMessage.edit(embed)

    // update remaining time
    const startTime = Date.now()
    const embedUpdateInterval = setInterval(() => {
      if (done) return clearInterval(embedUpdateInterval)
      remainingTime -= Math.abs(startTime - Date.now())
      if (remainingTime < 0) remainingTime = 0
      embed.fields[
        embed.fields.findIndex((f) => f.id === `remainingTime`)
      ].value = msToTimeString(remainingTime)
      if (remainingTime <= 0) {
        clearInterval(embedUpdateInterval)
        embed.fields = []
        end()
      }
      if (!sentMessage.deleted) sentMessage.edit(embed)
    }, 5000)

    // ------- update board view
    const updateBoardView = () => {
      const outputBoardString = board
        .map((row, index) =>
          index === targetY
            ? row.map((x, i) =>
              i === targetX
                ? x === `💢`
                  ? `👍`
                  : x === `✖️`
                    ? `👎`
                    : `📍`
                : x,
            )
            : row,
        )
        .map((row) => row.reduce((total, c) => total + c, ``))
        .join(`\n`)
        .replace(/🚢/gi, `◼️`)
      embed.description = `\`\`\`` + outputBoardString + `\`\`\``
      if (!sentMessage.deleted) sentMessage.edit(embed)
    }

    // ------- take shot
    const takeShot = () => {
      remainingShots--
      if (remainingShots <= 0) end()
      embed.fields[
        embed.fields.findIndex((f) => f.id === `remainingShots`)
      ].value = remainingShots
      if (board[targetY][targetX] === `🚢`) board[targetY][targetX] = `💢`
      else board[targetY][targetX] = `✖️`
      updateBoardView()
    }

    // ------- start game
    updateBoardView()
    if (!sentMessage.deleted) sentMessage.edit(embed)
    const reactions = [
      {
        emoji: `◀`,
        action: () => {
          targetX--
          if (targetX < 0) targetX = 0
          updateBoardView()
        },
      },
      {
        emoji: `▶️`,
        action: () => {
          targetX++
          if (targetX >= boardWidth) targetX = boardWidth
          updateBoardView()
        },
      },
      {
        emoji: `🔼`,
        action: () => {
          targetY--
          if (targetY < 0) targetY = 0
          updateBoardView()
        },
      },
      {
        emoji: `🔽`,
        action: () => {
          targetY++
          if (targetY >= boardWidth) targetY = boardWidth
          updateBoardView()
        },
      },
      {
        emoji: `🧨`,
        action: () => {
          takeShot()
        },
      },
    ]
    awaitReaction({
      msg: sentMessage,
      reactions,
      respondeeFilter: (u) => u.id === user.id,
      embed,
      guild,
      time,
    })

    // ------- end game
    const end = async () => {
      if (done) return
      done = true
      // ------- calculate and add XP
      const xp = Math.round(1000)
      const res = user.addXp(`munitions`, xp)

      // ------- update embed with results
      embed.description = `**${challengeCount} challenges in ${(
        time / 1000
      ).toFixed(1)} seconds**

Result: ${await applyCustomParams(msg, res.message)}`
      sentMessage.edit(embed)
    }
    // ------- end of game
    setTimeout(end, time)
  })
}
