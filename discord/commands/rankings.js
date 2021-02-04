const send = require('../actions/send')
const { log, applyCustomParams } = require('../botcommon')
const { allSkills } = require('../../game/gamecommon')
const { capitalize } = require('../../common')
const Discord = require('discord.js')
const awaitReaction = require('../actions/awaitReaction')
const runGuildCommand = require('../actions/runGuildCommand')

module.exports = {
  tag: 'rankings',
  documentation: {
    name: `rankings`,
    value: `Crew member rankings.`,
    emoji: '🏆',
    priority: 60,
  },
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:scores?|highscores?|rankings?)$`,
      'gi',
    ).exec(content)
  },
  async action({ msg, settings, ship, guild }) {
    log(msg, 'Rankings', msg.guild.name)

    const trophy = ['🥇', '🥈', '🥉', '🎖', '🎖']
    let rankings = allSkills.map(async (skill) => {
      const memberRanking = ship.members
        .filter((m) => m.xp && m.xp[skill.name])
        .sort((a, b) => b.xp[skill.name] - a.xp[skill.name])
        .slice(0, 5)
        .map(
          (m, index) =>
            `${trophy[index]} **%username%${m.id}%**\nLevel ${
              m.level[skill.name]
            } (${m.xp[skill.name]} xp)`,
        )
        .join('\n\n')
      return {
        name: `${skill.emoji} ${capitalize(skill.name)}`,
        value:
          '‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\n' +
          (await applyCustomParams(msg, memberRanking)),
      }
    })
    rankings = await Promise.all(rankings)

    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`Crew Rankings`)
      .addFields(rankings.map((s) => ({ ...s, inline: s.inline ?? true })))

    const lastMessage = (await send(msg, embed))[0]

    const trainableSkillActions = allSkills.map((skill) => {
      return {
        emoji: skill.emoji,
        action() {
          runGuildCommand({ msg, commandTag: 'train' + capitalize(skill.name) })
        },
      }
    })
    await awaitReaction({
      msg: lastMessage,
      reactions: trainableSkillActions,
      embed,
      guild,
      listeningType: 'training choice',
    })
  },
}
