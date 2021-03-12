const { log, canEdit } = require(`../botcommon`)
const Discord = require(`discord.js-light`)
const send = require(`../actions/send`)
const story = require(`../../game/basics/story/story`)

module.exports = {
  tag: `speed`,
  equipmentType: `engine`,
  pmOnly: true,
  documentation: {
    value: `Starts a vote to set the ship's speed.`,
    emoji: `⏩`,
    category: `ship`,
    priority: 75,
  },
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:go)$`, `gi`).exec(content)
  },
  async action({ msg, author, guild, authorCrewMemberObject }) {
    log(msg, `Go`, msg.guild?.name)

    if (guild.ship.status.docked)
      return authorCrewMemberObject.message(story.move.docked())

    if (guild.ship.isOverburdened())
      return authorCrewMemberObject.message(story.move.overburdened())

    // ---------- use stamina
    if (!authorCrewMemberObject) return console.log(`no user found in speed`)
    const staminaRes = authorCrewMemberObject.useStamina(`go`)
    if (!staminaRes.ok) return
    // const availableSpeedLevels = guild.ship.getAvailableSpeedLevels()
    // const availableDirections = guild.ship.getAvailableDirections()

    const embed = new Discord.MessageEmbed()
      .setColor(APP_COLOR)
      .setTitle(`Go | ${author.nickname}`)
      .setDescription(
        `Adjust the ship's trajectory by firing the thrusters!
Your power scales with your piloting skill and legacy among the crew, but lowers with ship mass.
Fuel will be used in accordance with the amount of thrust you generate.

This works by sending a message in the format \`<thrust %> <angle>\`.
⏩Thrust percent is \`0\`-\`100\` based on the engines' current maximum output.
🧭Angles are in degrees: \`0\` is right, \`90\` is up, \`180\` is left, and so on.

Example usage: \`50 275\`, \`100 12\`, etc.
Send a message in that format to fire the thrusters!
Be aware: the ship will gain momentum in the opposite direction that you fire in.

🚀Current ship trajectory is 🧭${guild.ship.getDirectionString()} degrees at ⏩${guild.ship.getSpeedString()}`,
      )

    const sentMessage = (await authorCrewMemberObject.message(embed))[0]

    const powerAngleRegex = /(\d{1,3})[ ,]+(-?\d{1,3})/gi

    const handler = async (receivedMessage) => {
      if (receivedMessage.author.id != msg.author.id) return

      const content = receivedMessage.content.replace(/[<>,.]/gi, ``)
      const res = powerAngleRegex.exec(content)
      if (!res) return
      let [unused, power, angle] = res
      power = Math.min(100, Math.max(0, parseInt(power))) / 100
      angle = parseInt(angle) % 360
      if (angle < 0) angle += 360

      clearTimeout(noInputTimeout)
      if (await canEdit(receivedMessage)) receivedMessage.delete()
      collector.stop()
      end(power, angle)
    }

    const collector = new Discord.MessageCollector(msg.channel, handler)
    const noInputTimeout = setTimeout(async () => {
      collector.stop()
    }, 40 * 1000)

    const end = async (power, angle) => {
      collector.stop()
      const thrustAmplification = 1 // todo use piloting etc to determine

      power *= thrustAmplification

      const res = await guild.ship.thrust({
        power,
        angle,
        thruster: authorCrewMemberObject,
      })
      console.log(res)
      send(msg, res.message)
    }
  },
}
