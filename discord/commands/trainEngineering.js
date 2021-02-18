const send = require(`../actions/send`)
const { log, applyCustomParams } = require(`../botcommon`)
const Discord = require(`discord.js`)
const lunicode = require(`Lunicode`)
const Fuse = require(`fuse.js`)
const runCountingTest = require(`../actions/runCountingTest`)

module.exports = {
  tag: `trainEngineering`,
  documentation: false,
  test (content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:trainengineering|engineeringtraining)$`,
      `gi`
    ).exec(content)
  },
  async action ({
    msg,
    author,
    guild,
    ship,
    authorCrewMemberObject,
    staminaRequired
  }) {
    //  log(msg, "Train Engineering", msg.guild.name);

    // ---------- use stamina
    const member =
      authorCrewMemberObject ||
      guild.ship.members.find((m) => m.id === msg.author.id)
    if (!member)
      return console.log(`no user found in trainEng`)
    if (!staminaRequired) {
      staminaRequired = authorCrewMemberObject.staminaRequiredFor(
        `engineering`
      )
    }
    const staminaRes = member.useStamina(`train`)
    if (!staminaRes.ok)
      return send(msg, staminaRes.message)

    const emojiChoices = [
      `🚀`,
      `👾`,
      `🔭`,
      `🪐`,
      `☄️`,
      `🛸`,
      `👽`,
      `🛰`,
      `1️⃣`,
      `0️⃣`,
      `💫`,
      `🌌`,
      `🌠`,
      `🤖`
    ]

    const choiceIndex = Math.floor(Math.random() * emojiChoices.length)

    const targetEmoji = emojiChoices[choiceIndex]
    emojiChoices.splice(choiceIndex, 1)

    const embed = new Discord.MessageEmbed()
      .setColor(APP_COLOR)
      .setTitle(`${author.nickname} | Engineering Training`)
      .setDescription(
        `The ship computer relies on a neural network to optimize ship systems, 
and it needs labeled training data to improve its performance. The input data is provided in *mojcode*, a special format used in modern ship computers.
         Count the number of \`${targetEmoji}\` in the following mojcode training data.`
      )

    const sentMessage = (await send(msg, embed))[0]

    const { rewardXp, guess, correctAnswer } = await runCountingTest({
      embed,
      msg,
      sentMessage,
      targetEmoji,
      emojiChoices
    })

    if (!guess)
      return

    const res = authorCrewMemberObject.addXp(`engineering`, rewardXp)

    description = ``
    if (guess == correctAnswer) {
      description += `Excellent — You found all ${guess} ${targetEmoji} in the training data!\n`
    }
    else if (guess > correctAnswer * 0.8) {
      description += `Wow, you were close — You found ${guess} ${targetEmoji} in the training data.\n`
    }
    else if (guess < correctAnswer * 0.8 && guess > correctAnswer * 0.25) {
      description += `Thanks for your effort — You found ${guess} ${targetEmoji} in the training data!\n`
    }
    else if (guess != 0 && guess < correctAnswer * 0.25) {
      description += `This must have been a tough one — At least you found ${guess} ${targetEmoji} in the training data!\n`
    }
    else {
      description += `Hey! Did you forget to count the ${targetEmoji}? Try again!\n`
    }

    description += `${await applyCustomParams(msg, res.message)}`

    embed.setDescription(description)
    sentMessage.edit(embed)
  }
}
