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
const minigames = {
  engineering: require('../common/engineeringMinigame'),
  mechanics: require('../common/mechanicsMinigame'),
  piloting: require('../common/pilotingMinigame'),
  munitions: require('../common/munitionsMinigame'),
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
  async action({ msg, guild, authorCrewMemberObject, author }) {
    log(msg, 'Train', msg.guild.name)

    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`Train | ${author.nickname}`)

    let trainableSkills = await authorCrewMemberObject.getTrainableSkills()

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
          guild,
        })
      },
    }))

    const sentMessage = (await send(msg, embed))[0]
    await awaitReaction({
      msg: sentMessage,
      reactions: trainableSkillsAsReactionOptions,
      embed,
      guild,
      commandsLabel: `Training Options`,
      listeningType: 'choice',
      respondeeFilter: (user) => user.id === msg.author.id,
    })
    sentMessage.delete()
  },
}
