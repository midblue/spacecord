const { capitalize } = require('../../../common')

module.exports = {
  guild: {
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
          `Your server already has a ship! It's called '${guild.ship.name}'.`,
      },
      first: (guild) =>
        `You find yourself aboard a discount ${guild.ship.modelDisplayName} dubbed '${guild.ship.name}' by its bawdry crew. The rusty hull groans under your weight as you make your way along the bridge.`,
    },
    name: {
      change: (newName) =>
        `Your crew cheers with applause as you unveil the ship's new name: "${newName}".`,
    },
  },
  crew: {
    add: {
      fail: {
        noShip: () => `Your server doesn't have a ship to join yet!`,
        existing: (id) =>
          `%username%${id}% is already a crew member on this ship!`,
      },
      first: (member, guild) =>
        `Gazing out of the cockpit at the open galaxy around you, you crack a wry smile. "Captain %username%${member.id}%, eh?" you chuckle. "I wonder how long that'll last?"`,
      success: (member, guild) =>
        `%username%${member.id}% emerges from a human growth pod. The crew of ${guild.ship.name} warmly welcomes them to their ranks, and points them toward the showers to wash all of the growth pod gunk off.`,
    },
  },
  fuel: {
    insufficient: () =>
      `The ship sputters. A readout above you flashes with the text, "ERROR: INSUFFICIENT_FUEL"`,
  },
  food: {
    insufficient: () => `Your ship is out of food!`,
    low: (amount, ticksLeft) =>
      `Your ship is dangerously low on food! You only have ${amount}${process.env.WEIGHT_UNIT_PLURAL}, which should only last ${ticksLeft} more ${process.env.TIME_UNIT}`,
  },
  power: {
    insufficient: (guild, amountNeeded) =>
      `The ship sputters. A readout above you flashes with the text, "ERROR: INSUFFICIENT_POWER <NEED ${amountNeeded}${process.env.POWER_UNIT} | HAVE ${guild.ship.power}${process.env.POWER_UNIT}>"`,
    add: {
      treadmill: (input, toAdd, total, max) =>
        `With ${input} runners, you generated ${toAdd}${
          process.env.POWER_UNIT
        } of power. The ship is now charged to ${total}${
          process.env.POWER_UNIT
        }. (${Math.round((total / max) * 100)}%)`,
    },
  },
  broadcast: {
    tooSoon: (model) =>
      `Your ${model} is still recharging from your previous broadcast.`,
    voteFailed: () =>
      `The crew decides collectively that broadcasting isn't the smartest move right now. A few sighs of relief are heard around the bridge.`,
    location: {
      send: ({ ship, equipment, powerUse, yesPercent }) =>
        `${Math.round(
          yesPercent * 100,
        )}% of the available crew members say yes, so you key in a few commands and listen as your ship's ${
          equipment.modelDisplayName
        } begins to hum. Your location has been broadcast to any ship within ${
          equipment.range
        } ${process.env.DISTANCE_UNIT}. This action uses ${powerUse} ${
          process.env.POWER_UNIT
        } of power.`,
      receive: (ship) =>
        `Your ship's antenna picks up a broadcast containing the coordinates [${Math.round(
          ship.location[0],
        )}, ${Math.round(ship.location[1])}], but with no further information.`,
    },
    distress: {
      send: ({ ship, equipment, powerUse, yesPercent }) =>
        `${Math.round(
          yesPercent * 100,
        )}% of the available crew members say yes, so you key in a few commands and listen as your ship's ${
          equipment.modelDisplayName
        } begins to hum. A distress signal has been broadcast to any ship within ${
          equipment.range
        } ${process.env.DISTANCE_UNIT}. This action uses ${powerUse} ${
          process.env.POWER_UNIT
        } of power.`,
      receive: (ship) =>
        `Your ship's antenna picks up a distress signal coming from the coordinates [${Math.round(
          ship.location[0],
        )}, ${Math.round(ship.location[1])}]!`,
    },
    surrender: {
      send: ({ ship, equipment, powerUse, yesPercent }) =>
        `${Math.round(
          yesPercent * 100,
        )}% of the available crew members agree, so you command your ship's ${
          equipment.modelDisplayName
        } to raise the proverbial white flag. A signal of your ship's surrender has been broadcast to any ship within ${
          equipment.range
        } ${process.env.DISTANCE_UNIT}. This action uses ${powerUse} ${
          process.env.POWER_UNIT
        } of power.`,
      receive: (ship) =>
        `Your ship's antenna picks up a surrender broadcast from the ship ${ship.name}!`,
    },
    factionRally: {
      send: ({ ship, equipment, powerUse, yesPercent }) =>
        `${Math.round(
          yesPercent * 100,
        )}% of the available crew members agree, so you hit the big ${
          ship.faction.color
        } button on your control panel. Your ship's ${
          equipment.modelDisplayName
        } vibrates in time with your faction's anthem. A rallying cry for ${
          ship.faction.emoji
        }${ship.faction.name} echoes across space to any ship within ${
          equipment.range
        } ${process.env.DISTANCE_UNIT}! This action uses ${powerUse} ${
          process.env.POWER_UNIT
        } of power.`,
      receive: (ship) =>
        `Your ship's antenna picks up a rallying cry for ${ship.faction.emoji}${ship.faction.name} from the ship ${ship.name}. Their anthem echoes through your speakers.`,
    },
    attack: {
      send: ({ ship, equipment, powerUse, yesPercent }) =>
        `${Math.round(
          yesPercent * 100,
        )}% of the available crew members agree, so you hit the button on your control panel marked with a skull and crossbones. You grin as your ship's ${
          equipment.modelDisplayName
        } broadcasts your avarice. An attack signal makes its way to any ship within ${
          equipment.range
        } ${process.env.DISTANCE_UNIT}! This action uses ${powerUse} ${
          process.env.POWER_UNIT
        } of power.`,
      receive: (ship) =>
        `Your ship's antenna goes silent for a moment, and then suddenly a monitor lights up in jarring red with this symbol.
				
888888888888888888888888888888888888888888888
888888888888888888888888888888888888888888888
888888888888888888P""  ""98888888888888888888
888888888P"88888P          988888"98888888888
888888888  "9888            888P"  8888888888
88888888888bo "9  d8o  o8b  P" od888888888888
88888888888888bob 98"  "8P dod888888888888888
88888888888888888    db    888888888888888888
8888888888888888888      88888888888888888888
8888888888888888P"9bo  odP"988888888888888888
8888888888888P" od88888888bo "988888888888888
88888888888   d88888888888888b   888888888888
888888888888oo8888888888888888oo8888888888888
888888888888888888888888888888888888888888888

The ship ${ship.name} is on the hunt!`,
      receiveLog: (ship) =>
        `You pick up a declaration of attack from the ship ${ship.name}!`,
    },
  },
  xp: {
    add: {
      missingUser: () => `Couldn't find the user to give experience!`,
      success: (
        id,
        skill,
        xpAmount,
        level,
        didLevelUp,
        levelSize,
        levelProgress,
        percentToLevel,
      ) =>
        `%username%${id}% gains ${xpAmount} experience in \`${skill}\`${
          didLevelUp ? `, leveling up to \`Level ${level}\`! 🎉🎊` : '.'
        } You're \`${levelProgress}/${levelSize} (${(
          percentToLevel * 100
        ).toFixed()}%)\` to \`Level ${level + 1}\`.`,
    },
  },
  action: {
    doesNotMeetRequirements: (requirements, member) =>
      `%username%${member.id}%, you need at least ${Object.keys(requirements)
        .map((r) => `level \`${requirements[r]}\` in \`${capitalize(r)}\` `)
        .join('and ')}to use that. You have${Object.keys(requirements)
        .map(
          (r) =>
            ` level \`${member?.level?.[r] || 0}\` in \`${capitalize(r)}\` `,
        )
        .join('and')}.`,
  },
  repair: {
    equipment: {
      beakdown: (model) => `Your ${model} has broken down.`,
      notFound: () =>
        `Sorry, I couldn't find the equipment you're trying to repair.`,
      success: (name, repairLevel) =>
        `You give your ship's ${name} a few good whacks with the hammer, and that seems to do the trick. It's repaired to ${Math.round(
          repairLevel * 100,
        )}% efficiency.`,
    },
  },
  vote: {
    insufficientVotes: () =>
      `Not enough crew members voted, and you don't feel comfortable making such an important decision without getting everyone's input. You decide to hold off for now.`,
  },
  move: {
    redirect: {
      success: (degrees, arrow, voteCount) =>
        `With ${voteCount} vote${
          voteCount === '1' ? '' : 's'
        }, your ship rotates to face ${arrow} ${degrees} degrees.`,
    },
    adjustSpeed: {
      success: (spedUp, newSpeed, speedPercent, voteCount) =>
        `With ${voteCount} vote${voteCount === '1' ? '' : 's'}, your ship ${
          spedUp ? 'speeds up' : 'slows down'
        } to ${newSpeed}${process.env.SPEED_UNIT}, which is ${Math.round(
          speedPercent * 100,
        )}% of its maximum power.`,
    },
  },
  log: {
    empty: () =>
      `Looks like there's nothing in your log yet. Explore the galaxy to discover things!`,
  },
  interact: {
    noShips: () => `There's no ship close enough to interact with.`,
  },
  discovery: {
    planet: (planet) =>
      `You've discovered ${planet.name}, a ${planet.getSizeDescriptor()} ${
        planet.color
      } planet located at [${planet.location.join(', ')}]${
        process.env.DISTANCE_UNIT
      }. It has been added to your galaxy map. Congratulations!`,
  },
}
