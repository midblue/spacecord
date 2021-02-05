const send = require("./send");
const Discord = require("discord.js");

module.exports = ({ msg, sentMessage, embed, targetEmoji }) => {
  return new Promise(async (resolve) => {
    const SNIPPET_WIDTH = 5;
    const SNIPPET_HEIGHT = 5;

    var mojcode_snippet = "";

    function randomNumber(min, max) {
      return Math.random() * (max - min) + min;
    }

    const MIN_CHANCE = 0.5;
    const MAX_CHANCE = 0.8;

    const target_chance = randomNumber(MIN_CHANCE, MAX_CHANCE);

    for (i = 0; i < SNIPPET_HEIGHT; i++) {
      for (j = 0; j < SNIPPET_WIDTH; j++) {
        if (Math.random() < target_chance) {
          mojcode_snippet += targetEmoji;
        } else {
          mojcode_snippet += "💦";
        }
      }
      if (i != SNIPPET_HEIGHT - 1) {
        mojcode_snippet += "\n";
      }
    }
    const regex = new RegExp(targetEmoji, "g");
    var count = (mojcode_snippet.match(regex) || []).length;
    mojcode_snippet += "\nDEBUG: COUNT=" + count;
    const time = Math.floor(count * 0.2 * 1000);

    embed.description += `\nYou have ${Math.round(
      time / 1000
    )} seconds to study the mojcode.`;
    sentMessage.edit(embed);

    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    await sleep(1 * 1000);

    const puzzleMessage = (await send(msg, mojcode_snippet))[0];

    setTimeout(() => {
      puzzleMessage.delete();
    }, time);

    const handler = (receivedMessage) => {
      if (receivedMessage.author.id != msg.author.id) return;

      const content = receivedMessage.content;
      const enteredNumber = parseInt(content);
      if (isNaN(enteredNumber)) return;

      const score = 10 * (count - Math.abs(count - enteredNumber));

      clearTimeout(noInputTimeout);

      receivedMessage.delete();
      collector.stop();
      resolve({
        score: score,
        guess: enteredNumber,
        correctAnswer: count,
      });
    };

    const collector = new Discord.MessageCollector(msg.channel, handler);
    const noInputTimeout = setTimeout(() => {
      sentMessage.delete();
      puzzleMessage.delete();
      collector.stop();
      resolve({});
    }, 20 * 1000);
  });
};
