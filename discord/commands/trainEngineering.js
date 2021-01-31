const auth = require('registry-auth-token')
const send = require('../actions/send')
const { log, username } = require('../botcommon')
const Discord = require('discord.js')
const lunicode = require('Lunicode')

module.exports = {
  tag: 'trainEngineering',
  test(content, settings) {
    return new RegExp(`^${settings.prefix}(?:trainengineering)$`, 'gi').exec(
      content,
    )
  },
  async action({ msg, settings, game, client, ship, authorCrewMemberObject }) {
    log(msg, 'Train Engineering', msg.guild.name)

    const currentLevel = (authorCrewMemberObject.levels || {}).engineering || 0
    const authorName = await username(msg.author)

    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`${authorName} | Engineering Training`)
      .setDescription(`Type the sentences as fast as you can!
You'll gain XP for speed and accuracy.
Capitalization doesn't matter, but copy-and-pasting won't work.
Your crewmates can help too, if they want to.`)

    const lastMessage = (await send(msg, embed))[0]

    const textOptions = [`Here's my fun test sentence.`]

    const challenges = []
    challenges.push(
      (
        await send(
          msg,
          lunicode.tools.tiny.encode(
            textOptions[Math.floor(Math.random() * textOptions.length)],
          ),
        )
      )[0],
    )

    setTimeout(() => {
      console.log(challenges)
      challenges.forEach((c) => c.delete())

      embed.setDescription(`Result:`)
      lastMessage.edit(embed)
    }, 10000)
  },
}
