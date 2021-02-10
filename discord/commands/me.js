const send = require('../actions/send')
const { log } = require('../botcommon')
const {
  numberToEmoji,
  capitalize,
  percentToTextBars,
  msToTimeString,
} = require('../../common')
const awaitReaction = require('../actions/awaitReaction')
const Discord = require('discord.js-light')
const staminaRequirements = require('../../game/basics/crew/staminaRequirements')
const runGuildCommand = require('../actions/runGuildCommand')
const trainingActions = {
  engineering: require('./trainEngineering').action,
  mechanics: require('./trainMechanics').action,
}

module.exports = {
  tag: 'me', // this is also the 'train' command
  documentation: {
    value: `See your stats and take actions.`,
    emoji: '💁‍♂️',
    category: 'crew',
    priority: 70,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:me)$`, 'gi').exec(content)
  },
  async action({
    msg,
    settings,
    game,
    client,
    ship,
    guild,
    authorCrewMemberObject,
    author,
  }) {
    log(msg, 'Me', msg.guild.name)
    // my skills, my options to train things, etc

    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`${author.nickname}'s Stats`)

    const userAge =
      ((Date.now() - (authorCrewMemberObject.joined || Date.now())) *
        process.env.REAL_TIME_TO_GAME_TIME_MULTIPLIER) /
      process.env.TIME_UNIT_SHORTS_PER_LONG
    embed.fields.push(
      ...[
        {
          name: `👵🏽 Age`,
          value: userAge.toFixed(2) + ' ' + process.env.TIME_UNIT_LONG,
          inline: true,
        },
        {
          name: `💪 Stamina`,
          value:
            percentToTextBars(authorCrewMemberObject.stamina || 0) +
            `\n${
              Math.round(
                (authorCrewMemberObject.stamina || 0) *
                  authorCrewMemberObject.maxStamina() *
                  10,
              ) / 10
            }/${Math.round(authorCrewMemberObject.maxStamina() * 10) / 10}`,
          inline: true,
        },
        {
          name: `🛌 Stamina Gain`,
          value: `\`+ 💪${
            Math.round(authorCrewMemberObject.staminaGainPerTick() * 10) / 10
          }\` stamina/ship ${process.env.TIME_UNIT_SINGULAR}
(Next day is in ${msToTimeString(guild.context.timeUntilNextTick())})`,
          inline: true,
        },
      ],
    )

    // skills section

    let trainableSkills = await authorCrewMemberObject.getTrainableSkills()
    const trainingActionArguments = arguments[0]

    trainableSkills = trainableSkills
      .slice(0, 10)
      .map((skill) => ({
        ...skill,
        ...authorCrewMemberObject.skillLevelDetails(skill.name),
      }))
      .sort((a, b) => b.xp - a.xp)

    const trainableSkillsAsReactionOptions = trainableSkills.map((e) => ({
      emoji: e.emoji,
      action() {
        trainingActions[e.name](trainingActionArguments)
      },
    }))

    const trainableSkillsField = {
      name: 'Skills',
      value: trainableSkills
        .map((e) => {
          return `${e.emoji} **${capitalize(e.name)}**: Level ${e.level}`
        })
        .join('\n'),
    }
    embed.fields.push(trainableSkillsField)

    const reactions = [
      {
        emoji: '🏋️‍♂️',
        label: 'Train your skills',
        action: async () => {
          runGuildCommand({ msg, commandTag: 'train' })
        },
      },
    ]

    const sentMessage = (await send(msg, embed))[0]
    await awaitReaction({
      msg: sentMessage,
      reactions: reactions,
      embed,
      guild,
    })
  },
}
