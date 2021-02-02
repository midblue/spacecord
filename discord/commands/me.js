const send = require('../actions/send')
const { log } = require('../botcommon')
const { numberToEmoji, capitalize } = require('../../common')
const awaitReaction = require('../actions/awaitReaction')
const Discord = require('discord.js')
const trainingActions = {
  engineering: require('./trainEngineering').action,
  mechanics: require('./trainMechanics').action,
}

module.exports = {
  tag: 'me', // this is also the 'train' command
  documentation: {
    value: `See your stats and train your character!`,
    emoji: '💁‍♂️',
    priority: 70,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:me|train|xp)$`, 'gi').exec(content)
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

    let trainableSkills = await authorCrewMemberObject.getTrainableSkills()
    const trainingActionArguments = { ...arguments[0] }

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

    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`${author.nickname}'s Stats`)
      .setDescription(
        trainableSkills
          .map((e) => {
            return `${e.emoji} **${capitalize(e.name)}**: **Level ${
              e.level
            }** (${e.levelProgress}/${e.levelSize}, ${(
              e.percentToLevel * 100
            ).toFixed(0)}% to level ${e.level + 1})`
          })
          .join('\n'),
      )

    const sentMessages = await send(msg, embed)
    const lastMessage = sentMessages[sentMessages.length - 1]
    await awaitReaction({
      msg: lastMessage,
      reactions: trainableSkillsAsReactionOptions,
      embed,
      guild,
      listeningType: 'training choice',
    })
  },
}
