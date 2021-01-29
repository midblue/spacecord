module.exports = {
  ship: {
    get: {
      fail: {
        existing: (guild) =>
          `Your server already has a ship! It's called '${guild.ship.name}'. How rude of you to forget!`,
      },
      first: (
        guild,
      ) => `Your ship, a ${guild.ship.modelDisplayName} dubbed '${guild.ship.name}' by its bawdry crew of former owners, grumbles to life under you as you sit at the cockpit.
What will you do next, captain?`,
    },
  },
  crew: {
    add: {
      fail: {
        noShip: () => `Your server doesn't have a ship to join yet!`,
        existing: (id) =>
          `%username%${id} is already a crew member on this ship! How rude of you to forget!`,
      },
      success: (member, guild) =>
        `The crew of ${guild.ship.name} warmly welcome %username%${member.id} to their ranks.`,
    },
  },
}
