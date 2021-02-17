const send = require('../actions/send')
const { log } = require('../botcommon')
const { capitalize, usageTag } = require('../../common')
const awaitReaction = require('../actions/awaitReaction')
const Discord = require('discord.js-light')
const minigames = {
  engineering: require('../minigames/engineeringMinigame'),
  mechanics: require('../minigames/mechanicsMinigame'),
  piloting: require('../minigames/pilotingMinigame'),
  munitions: require('../minigames/munitionsMinigame')
}

module.exports = {
  tag: 'train', // this is also the 'train' command
  documentation: {
    value: 'Train your character\'s skills!',
    emoji: '🏋️‍♂️',
    category: 'crew',
    priority: 69
  },
  test (content, settings) {
    return new RegExp(`^${settings.prefix}(?:t|train|xp)$`, 'gi').exec(content)
  },
  async action ({ msg, guild, authorCrewMemberObject, author }) {
    log(msg, 'Train', msg.guild.name)

    const embed = new Discord.MessageEmbed()
      .setColor(APP_COLOR)
      .setTitle(`🏋️‍♂️ Train | ${author.nickname}`)
    embed.description = 'You step into the gym, which resembles less the sweaty muscle factories of the old days and more a holographic light show. Other crew members around you are deeply immersed in simulations of all kinds.'

    let trainableSkills = await authorCrewMemberObject.getTrainableSkills()

    trainableSkills = trainableSkills
      .slice(0, 10)
      .map((skill) => ({
        ...skill,
        ...authorCrewMemberObject.skillLevelDetails(skill.name)
      }))
      .sort((a, b) => b.xp - a.xp)

    const trainableSkillsAsReactionOptions = trainableSkills.map((e) => ({
      emoji: e.emoji,
      label:
        `**${capitalize(e.name)}**: **Level ${e.level}** (${e.levelProgress}/${
          e.levelSize
        }, ${(e.percentToLevel * 100).toFixed(0)}% to level ${e.level + 1}) ` +
        usageTag(0, e.staminaRequired),

      action: ({ msg, guild }) => {
        const member =
          authorCrewMemberObject ||
          guild.ship.members.find((m) => m.id === msg.author.id)
        if (!member) return console.log('no user found in train')
        const staminaRes = member.useStamina(e.staminaRequired)
        if (!staminaRes.ok) return send(msg, staminaRes.message)

        minigames[e.name]({
          msg,
          user: member,
          guild
        })
      }
    }))

    const sentMessage = (await send(msg, embed))[0]
    await awaitReaction({
      msg: sentMessage,
      reactions: trainableSkillsAsReactionOptions,
      embed,
      guild,
      commandsLabel: 'Training Options',
      listeningType: 'choice',
      respondeeFilter: (user) => user.id === msg.author.id
    })
    sentMessage.delete()
  }
}
