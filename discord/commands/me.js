const send = require(`../actions/send`)
const { log } = require(`../botcommon`)
const {
  numberToEmoji,
  capitalize,
  percentToTextBars,
  msToTimeString,
} = require(`../../common`)
const awaitReaction = require(`../actions/awaitReaction`)
const Discord = require(`discord.js-light`)
const runGuildCommand = require(`../actions/runGuildCommand`)

module.exports = {
  tag: `me`,
  pmOnly: true,
  documentation: {
    value: `See your stats and take actions.`,
    emoji: `💁‍♂️`,
    category: `crew`,
    priority: 70,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:me|stamina|aboutme)$`, `gi`).exec(
      content,
    )
  },
  async action({ msg, guild, authorCrewMemberObject, author }) {
    log(msg, `Me`, guild.name)

    const embed = new Discord.MessageEmbed()
      .setColor(APP_COLOR)
      .setTitle(`${author.nickname}'s Stats`)

    const userAge =
      (Date.now() - (authorCrewMemberObject.joined || Date.now())) /
      TIME_UNIT_LONG_LENGTH
    embed.fields.push(
      ...[
        {
          name: `👵🏽 Age`,
          value: userAge.toFixed(2) + ` ` + TIME_UNIT_LONGS,
          inline: true,
        },
        {
          name: `💪 Stamina`,
          value:
            percentToTextBars(authorCrewMemberObject.stamina || 0) +
            `\n${Math.round(
              (authorCrewMemberObject.stamina || 0) *
              authorCrewMemberObject.maxStamina() *
              10,
            ) / 10
            }/${Math.round(authorCrewMemberObject.maxStamina() * 10) / 10}`,
          inline: true,
        },
        {
          name: `🛌 Stamina Gain`,
          value: `\`+ 💪${Math.round(authorCrewMemberObject.staminaGainPerTick() * 100) / 100
            }\` stamina/${TIME_UNIT}`,
          inline: true,
        },
      ],
    )

    // skills section

    let trainableSkills = await authorCrewMemberObject.getTrainableSkills()

    trainableSkills = trainableSkills
      .slice(0, 10)
      .map((skill) => ({
        ...skill,
        ...authorCrewMemberObject.skillLevelDetails(skill.name),
      }))
      .sort((a, b) => b.xp - a.xp)

    const trainableSkillsField = {
      name: `Skills`,
      value: trainableSkills
        .map((e) => {
          return `${e.emoji} **${capitalize(e.name)}**: Level ${e.level}`
        })
        .join(`\n`),
    }
    embed.fields.push(trainableSkillsField)

    const reactions = [
      {
        emoji: `🏋️‍♂️`,
        label: `Train your skills`,
        action: async ({ user }) => {
          runGuildCommand({
            msg: { ...msg, author: user },
            commandTag: `train`,
          })
        },
      },
    ]

    const sentMessage = (await send(msg.author, embed))[0]
    awaitReaction({
      msg: sentMessage,
      reactions: reactions,
      embed,
      guild,
    })
  },
}
