const send = require('../actions/send')
const { log } = require('../botcommon')
const {
  numberToEmoji,
  capitalize,
  percentToTextBars,
  msToTimeString,
  usageTag,
} = require('../../common')
const awaitReaction = require('../actions/awaitReaction')
const Discord = require('discord.js-light')
const staminaRequirements = require('../../game/basics/crew/staminaRequirements')
const trainingActions = {
  engineering: require('./trainEngineering').action,
  mechanics: require('./trainMechanics').action,
  piloting: require('./trainPiloting').action,
  munitions: require('./trainMunitions').action,
}

module.exports = {
  tag: 'train', // this is also the 'train' command
  documentation: {
    value: `Train your character's skills!`,
    emoji: '🏋️‍♂️',
    category: 'crew',
    priority: 69,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:train|xp)$`, 'gi').exec(content)
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
    log(msg, 'Train', msg.guild.name)

    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`Train | ${author.nickname}`)

    embed.fields.push(
      ...[
        {
          name: `🏋️‍♂️ Training Stamina Cost`,
          value: `\`- 💪${staminaRequirements['train']}\` stamina`,
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
      label:
        `**${capitalize(e.name)}**: **Level ${e.level}** (${e.levelProgress}/${
          e.levelSize
        }, ${(e.percentToLevel * 100).toFixed(0)}% to level ${e.level + 1}) ` +
        usageTag(0, 'train'),
      action() {
        trainingActions[e.name](trainingActionArguments)
      },
    }))

    const sentMessages = await send(msg, embed)
    const sentMessage = sentMessages[sentMessages.length - 1]
    await awaitReaction({
      msg: sentMessage,
      reactions: trainableSkillsAsReactionOptions,
      embed,
      guild,
      listeningType: 'training choice',
    })
    sentMessage.delete()
  },
}
