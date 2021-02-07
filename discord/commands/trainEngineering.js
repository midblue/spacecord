const send = require("../actions/send");
const { log, applyCustomParams } = require("../botcommon");
const Discord = require("discord.js");
const lunicode = require("Lunicode");
const Fuse = require("fuse.js");
const runCountingTest = require("../actions/runCountingTest");

module.exports = {
  tag: "trainEngineering",
  documentation: { name: `trainengineering` },
  test(content, settings) {
    return new RegExp(
      `^${settings.prefix}(?:trainengineering|engineeringtraining)$`,
      "gi"
    ).exec(content);
  },
  async action({ msg, author, ship, authorCrewMemberObject }) {
    log(msg, "Train Engineering", msg.guild.name);

    const emojiChoices = [
      "🚀",
      "👾",
      "🔭",
      "🪐",
      "☄️",
      "🛸",
      "👽",
      "🛰",
      "1️⃣",
      "0️⃣",
      "💫",
      "🌌",
      "🌠",
      "🤖",
    ];

    const choiceIndex = Math.floor(Math.random() * emojiChoices.length);

    const targetEmoji = emojiChoices[choiceIndex];
    emojiChoices.splice(choiceIndex, 1);

    const embed = new Discord.MessageEmbed()
      .setColor(process.env.APP_COLOR)
      .setTitle(`${author.nickname} | Engineering Training`)
      .setDescription(
        `Count the number of \`${targetEmoji}\` in the following mojcode snippet.`
      );

    const sentMessage = (await send(msg, embed))[0];

    const { rewardXp, guess, correctAnswer } = await runCountingTest({
      embed,
      msg,
      sentMessage,
      targetEmoji,
      emojiChoices,
    });

    if (!guess) return;

    const res = authorCrewMemberObject.addXp("engineering", rewardXp);

    embed.setDescription(
      `**You guessed that ${guess} \`${targetEmoji}\` were in the mojcode snippet.
      There were ${correctAnswer}, so you earned ${rewardXp} XP!**
      Result: ${await applyCustomParams(msg, res.message)}`
    );
    sentMessage.edit(embed);
  },
};
