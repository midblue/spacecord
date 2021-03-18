const send = require(`../actions/send`)
const { log, canEdit } = require(`../botcommon`)
const Discord = require(`discord.js-light`)
const { applyCustomParams } = require(`../botcommon`)
const { allSkills } = require(`../../game/gamecommon`)
const readyCheck = require(`../actions/readyCheck`)
const { msToTimeString } = require(`../../common`)
const awaitReaction = require(`../actions/awaitReaction`)

module.exports = {
  tag: `trainMunitions`,
  pm: true,
  documentation: false,
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:trainmunitions?|munitions?training)$`,
      `gi`,
    ).exec(content)
  },
  async action({ msg, guild, authorCrewMemberObject, staminaRequired }) {
    log(msg, `Train Munitions`, msg.guild?.name)

    // ---------- use stamina
    const member =
      authorCrewMemberObject ||
      guild.ship.members.find((m) => m.id === msg.author.id)
    if (!member) return console.log(`no user found in trainMunitions`)
    if (!staminaRequired) {
      staminaRequired = authorCrewMemberObject.staminaRequiredFor(`munitions`)
    }
    const staminaRes = member.useStamina(staminaRequired)
    if (!staminaRes.ok) return

    const emoji = allSkills.find((s) => s.name === `munitions`).emoji

    // ------- generate general game variables
    let done = false
    const userLevel = authorCrewMemberObject.level.munitions || 0
    const targetSizes = [2, 3, 4]
    const totalTargetSquares = targetSizes.reduce((t, target) => t + target, 0)
    const boardWidth = Math.max(
      4,
      Math.round(userLevel / 4),
      targetSizes.reduce((t, c) => Math.max(t, c), 0),
    )
    const shots =
      targetSizes.reduce((t, c) => t + c, 0) +
      Math.max(3, boardWidth - userLevel)
    let remainingShots = shots
    const time = shots * 10 * 1000
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
    embed.description = `Focus and logic prevail in the midst of a firefight. This training has been developed to sharpen your tactics and your precision under duress.

Use your 🧨 Shots to take down the practice dummies hidden in the inky blackness of space.
There are \`${
      targetSizes.length
    }\` enemy ships somewhere on the board with lengths ${targetSizes
      .slice(0, targetSizes.length - 2)
      .map((s) => `\`${s}\``)
      .join(`, `)}, and \`${targetSizes[targetSizes.length - 1]}\`.
Position your target reticle with \`🔼🔽◀▶️\`, and fire with \`🧨\`.`
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
    const ready = await readyCheck({
      msg: sentMessage,
      embed,
      user: authorCrewMemberObject,
    })
    if (!ready) {
      if (await canEdit(sentMessage)) sentMessage.delete().catch(console.log)
      return
    }

    embed.fields = [
      {
        name: `Key`,
        value: `\`📍Current Target\`, \`💢Hit\`, \`✖️Miss\`, \`👍Current(Hit)\`, \`👎Current(Miss)\``,
        id: `key`,
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
    await sentMessage.edit(embed).catch(console.log)

    // update remaining time
    let startTime = Date.now()
    const embedUpdateInterval = setInterval(() => {
      if (done) return clearInterval(embedUpdateInterval)
      remainingTime -= Math.abs(startTime - Date.now())
      startTime = Date.now()
      if (remainingTime < 0) remainingTime = 0
      embed.fields[
        embed.fields.findIndex((f) => f.id === `remainingTime`)
      ].value = msToTimeString(remainingTime)
      if (remainingTime <= 0) {
        clearInterval(embedUpdateInterval)
        console.log(`time`)
        embed.fields = []
        end()
      }
      if (!sentMessage.deleted) sentMessage.edit(embed).catch(console.log)
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
      if (!sentMessage.deleted) sentMessage.edit(embed).catch(console.log)
    }

    // ------- take shot
    const takeShot = () => {
      remainingShots--
      if (remainingShots <= 0) return end()

      embed.fields[
        embed.fields.findIndex((f) => f.id === `remainingShots`)
      ].value = remainingShots
      if (board[targetY][targetX] === `🚢`) board[targetY][targetX] = `💢`
      else board[targetY][targetX] = `✖️`

      const hits = board.reduce(
        (t1, row) =>
          t1 + row.reduce((t2, col) => t2 + (col === `💢` ? 1 : 0), 0),
        0,
      )
      const percent = hits / totalTargetSquares
      if (percent === 1) return end()

      updateBoardView()
    }

    // ------- start game
    updateBoardView()
    if (!sentMessage.deleted) sentMessage.edit(embed).catch(console.log)
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
      respondeeFilter: (u) => u.id === authorCrewMemberObject.id,
      embed,
      guild,
      time,
    })

    // ------- end game
    const end = async () => {
      if (done) return
      done = true

      const hits = board.reduce(
        (t1, row) =>
          t1 + row.reduce((t2, col) => t2 + (col === `💢` ? 1 : 0), 0),
        0,
      )
      const percent = hits / totalTargetSquares

      // ------- calculate and add XP
      const res = authorCrewMemberObject.train(`munitions`, percent)

      // ------- update embed with results
      embed.fields = []
      embed.description += `\n**${Math.round(percent * 1000) / 10}% hit**

Result: ${await applyCustomParams(msg, res.message)}`
      sentMessage.edit(embed).catch(console.log)
    }
    // ------- end of game
    setTimeout(end, time)
  },
}
