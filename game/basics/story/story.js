module.exports = {
  status: {
    get: {
      fail: {
        noGuild: () =>
          `It doesn't look like your server has started the game yet. Use \`%command%spawn%\` to get started!`,
      },
    },
  },
  prompts: {
    startGame: () =>
      `What will you do, captain? Use \`%command%ship%\` to check the status of your ship.`,
  },
  ship: {
    get: {
      fail: {
        existing: (guild) =>
          `Your server already has a ship! It's called '${guild.ship.name}'. How rude of you to forget!`,
      },
      first: (guild) =>
        `You're aboard a discount ${guild.ship.modelDisplayName} dubbed '${guild.ship.name}' by its bawdry crew. It groans under your weight as you make your way along the bridge.`,
    },
  },
  crew: {
    add: {
      fail: {
        noShip: () => `Your server doesn't have a ship to join yet!`,
        existing: (id) =>
          `%username%${id}% is already a crew member on this ship! How rude of you to forget!`,
      },
      first: (member, guild) =>
        `Gazing out of the cockpit at the open galaxy around you, you crack a wry smile. "Captain %username%${member.id}%, eh?" you chuckle. "Wonder how long that'll last?"`,
      success: (member, guild) =>
        `%username%${member.id}% emerges from a human growth pod. The crew of ${guild.ship.name} warmly welcomes them to their ranks, and points them toward the showers to wash all of the growth pod gunk off.`,
    },
  },
  power: {
    insufficient: (guild, amountNeeded) =>
      `The ship sputters. A readout above you flashes with the text, "ERROR: INSUFFICIENT_POWER <NEED ${amountNeeded} | HAVE ${guild.ship.power}>"`,
    add: {
      treadmill: (input, toAdd, total, max) =>
        `With ${input} runners, you generated ${toAdd} power. The ship is now charged to ${total} power. (${Math.round(
          (total / max) * 100,
        )}%)`,
    },
  },
  move: {
    // redirect: {
    //   noVotes: () => `Your crew decides to stay the course.`,
    //   success: (degrees, arrow) =>
    //     `The crew has spoken. Your ship rotates to face ${arrow} ${degrees} degrees.`,
    // },
  },
}
