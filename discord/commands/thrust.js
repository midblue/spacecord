const { log, canEdit } = require(`../botcommon`)
const Discord = require(`discord.js-light`)
const send = require(`../actions/send`)
const story = require(`../../game/basics/story/story`)

module.exports = {
  tag: `thrust`,
  equipmentType: `engine`,
  pmOnly: true,
  documentation: {
    value: `Adds thrust to the ship`,
    emoji: `⏩`,
    category: `ship`,
    priority: 75,
  },
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:g|go|t|thrust|boost)(?: <?([\\d.]+)>?(?:,? <?([\\d.]+)%?>?)?)?$`,
      `gi`,
    ).exec(content)
  },
  async action({
    settings,
    msg,
    match,
    author,
    guild,
    authorCrewMemberObject,
  }) {
    log(msg, `Thrust`, match)

    if (guild.ship.status.docked)
      return authorCrewMemberObject.message(story.move.docked())

    if (guild.ship.isOverburdened())
      return authorCrewMemberObject.message(story.move.overburdened())

    if (match[1]) {
      // ---------- use stamina
      if (!authorCrewMemberObject) return console.log(`no user found in thrust`)
      const staminaRes = authorCrewMemberObject.useStamina(`thrust`)
      if (!staminaRes.ok) return

      let angle = parseFloat(match[1])
      angle = ((angle % 360) + 360) % 360

      let power = 100
      if (match[2]) power = parseFloat(match[2])
      if (power > 100) power = 100
      if (power < 0) power = 0
      power /= 100

      const thrustAmplification = 1 // todo use piloting etc to determine
      power *= thrustAmplification

      const res = await guild.ship.thrust({
        power,
        angle,
        thruster: authorCrewMemberObject,
      })
      if (!res.ok) authorCrewMemberObject.message(res.message)
      else guild.message(res.message, msg)
    } else {
      const embed = new Discord.MessageEmbed()
        .setColor(APP_COLOR)
        .setTitle(`Thrust`)
        .setDescription(
          `Adjust the ship's trajectory by firing the thrusters!
This works by sending a message in the format \`${
            settings.prefix
          }thrust <angle> <thrust %>\`.

Your power scales with your piloting skill and legacy among the crew, but lowers with ship mass.
Fuel will be used in accordance with the amount of thrust you generate.

🧭Angles are in degrees: \`0\` is right, \`90\` is up, \`180\` is left, and so on.
⏩Thrust defaults to 100 percent, and is \`0\`-\`100\` based on the engines' current maximum output.

Example usage: \`${settings.prefix}thrust 275\`, \`${
            settings.prefix
          }thrust 12 75\`, etc.
Send a message in that format to fire the thrusters!
Be aware: the ship will gain momentum in the opposite direction that you fire in.

🚀Current ship trajectory is 🧭${guild.ship.getDirectionString()} degrees at ⏩${guild.ship.getSpeedString()}`,
        )

      authorCrewMemberObject.message(embed)
    }
  },
}
