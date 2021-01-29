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
    status: (guild) => ({
      message: JSON.stringify(guild.ship, null, 2),
      options: {
        label: '🚀',
      },
    }),
  },
  ship: {
    get: {
      fail: {
        existing: (guild) =>
          `Your server already has a ship! It's called '${guild.ship.name}'. How rude of you to forget!`,
      },
      first: (guild) =>
        `You scrape together every credit you can find, and manage to find a discount ${guild.ship.modelDisplayName} dubbed '${guild.ship.name}' by its bawdry crew of former owners. It groans under your weight as you step aboard to give it a final check.`,
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
        `You amble along the deck of ${guild.ship.name}, pushing buttons here and there. Everything seems to be in working order, if a bit dusty. You thank the owners and send them on their way.
Gazing out of the cockpit at the spaceport vista around you, you crack a wry smile. "Captain %username%${member.id}%, eh?" you chuckle. "Wonder how long that'll last?"`,
      success: (member, guild) =>
        `The crew of ${guild.ship.name} warmly welcome %username%${member.id}% to their ranks.`,
    },
  },
}
