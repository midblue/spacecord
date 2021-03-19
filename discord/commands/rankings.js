const send = require(`../actions/send`)
const { log, applyCustomParams } = require(`../botcommon`)
const { allSkills } = require(`../../game/gamecommon`)
const { capitalize } = require(`../../common`)
const Discord = require(`discord.js-light`)

module.exports = {
  tag: `rankings`,
  pm: true,
  documentation: {
    name: `rankings`,
    value: `Crew member rankings.`,
    emoji: `🏆`,
    category: `crew`,
    priority: 60,
  },
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:scores?|highscores?|ranki?n?g?s?)$`,
      `gi`,
    ).exec(content)
  },
  async action({ msg, settings, ship, guild }) {
    log(msg, `Rankings`, msg.guild?.name)

    const trophy = [`🥇`, `🥈`, `🥉`, `🎖`, `🎖`]
    let rankings = allSkills.map(async (skill) => {
      const memberRanking = ship.members
        .filter((m) => m.xp && m.xp[skill.name])
        .sort((a, b) => b.xp[skill.name] - a.xp[skill.name])
        .slice(0, 5)
        .map(
          (m, index) =>
            `${trophy[index]} **%username%${m.id}%**: Level ${
              m.level[skill.name]
            }`, // (${m.xp[skill.name]} xp)
        )
        .join(`\n`)
      return {
        name: `${skill.emoji} ${capitalize(skill.name)}`,
        value:
          // '‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\n' +
          await applyCustomParams(msg, memberRanking),
      }
    })
    rankings = (await Promise.all(rankings)).filter((r) => r.value)

    const embed = new Discord.MessageEmbed()
      .setColor(APP_COLOR)
      .setTitle(`Crew Rankings`)
      .addFields(rankings.map((s) => ({ ...s, inline: s.inline ?? true })))

    send(msg, embed)
  },
}
