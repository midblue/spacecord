const { capitalize, garble } = require('../../../common')

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
        `You find yourself aboard a discount ${guild.ship.displayName} dubbed '${guild.ship.name}' by its bawdry crew. The rusty hull groans under your weight as you make your way along the bridge.`,
    },
    name: {
      change: (newName) =>
        `Your crew cheers with applause as you unveil the ship's new name: "${newName}".`,
    },
    captain: {
      change: (user) =>
        `Your crew cheers with applause as the new captain %username%${user.id}% steps up to the helm of the ship.`,
    },
    die: (ship) =>
      `There are screams of horror as ${ship.name} shudders, cracks, and breaks apart in the torrent of the sudden vacuum. Having barely managed to pile aboard as the fatal attack hit, your crew watches sullenly from the window of the escape pod as your ship is mercilessly plundered by your attackers. Captain %username%${ship.captain}% turns to the disheartened crew.\n"At least... At least we survived," is all they can manage to croak out before turning away in shame.\n\n${ship.name}, our home, our legacy, has been destroyed. However, the battered crew lives on! "Maybe we can use some of our knowledge and training to start again, and do things right this time," they think to themselves.\n\nThe ship along with its equipment and cargo are gone, but crew members will maintain most of their skills, with a penalty.\n\nCaptain, whenever you've recovered, use %command%spawn% to rally your crew and start again.`,
    respawn: (oldShip, newShip) =>
      `Your escape pod crash landed on ${capitalize(
        newShip.status.docked,
      )}. It took some time, but the whole crew worked manual labor in the locals' fields in exchange for enough credits to buy an extremely basic ship.\n\nWith determined expressions on their faces, the crew that once proudly served aboard ${
        oldShip.name
      } clamber into their stations aboard their new ship, ${
        newShip.name
      }. Weathered hands grasp familiar instruments as the experienced crew find their places in their new home. It's cramped, but everyone is cautiously optimistic that this ship will shepard them through to a fresh start.\n\n%username%${
        oldShip.captain
      }% takes their place at the helm as the ship powers up for the first time.\n\nYou look up once again to see the vast sky above you.\nWhat's next, captain? What's next, crew?`,
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
    stamina: {
      notEnough: (id, current, needed) =>
        `%username%${id}%, you need 💪${Math.round(
          needed,
        )} stamina for that task, and you currently have 💪${Math.round(
          current,
        )}.`,
    },
  },
  map: {
    empty: () =>
      `Your galaxy map is, sadly, blank. You stare at the empty screen for a moment, then turn away filled with determination to explore.`,
  },
  scanShip: {
    noScanner: () =>
      `Since your ship has no scanner equipped, all you can see is the other ship's name, enscribed in block letters along its hull.`,
    repair: () =>
      `You start to scan the ship, but your scanner whines to a halt mid-scan. Maybe repairing would help?`,
    detected: (didSucceed, scanner) =>
      `Your engineers have managed to detect that a nearby craft has ${
        didSucceed ? 'scanned' : 'attempted to scan'
      } you with a ${scanner.displayName}${
        didSucceed ? '' : ', but failed to get any information'
      }.`,
    ourScanDetected: () => `Your scan was detected by the other ship.`,
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
      send: ({ ship, equipment, powerUse, yesPercent, effectiveRange }) =>
        `${Math.round(
          yesPercent * 100,
        )}% of the available crew members say yes, so you key in a few commands and listen as your ship's ${
          equipment.displayName
        } begins to hum. Your location has been broadcast to any ship within ${
          Math.round(effectiveRange * 10) / 10
        } ${process.env.DISTANCE_UNIT}. This action uses ⚡️${powerUse} ${
          process.env.POWER_UNIT
        } of power.`,
      receive: (ship, garbleAmount = 0) =>
        `Your ship's antenna picks up a broadcast: "${garble(
          `Our location is [${Math.round(ship.location[0])}, ${Math.round(
            ship.location[1],
          )}]`,
          garbleAmount,
        )}"`,
    },
    distress: {
      send: ({ ship, equipment, powerUse, yesPercent, effectiveRange }) =>
        `${Math.round(
          yesPercent * 100,
        )}% of the available crew members say yes, so you key in a few commands and listen as your ship's ${
          equipment.displayName
        } begins to hum. A distress signal has been broadcast to any ship within ${
          Math.round(effectiveRange * 10) / 10
        } ${process.env.DISTANCE_UNIT}. This action uses ⚡️${powerUse} ${
          process.env.POWER_UNIT
        } of power.`,
      receive: (ship, garbleAmount = 0) =>
        `Your ship's antenna picks up a broadcast: "${garble(
          `We need help! Please rescue us at [${Math.round(
            ship.location[0],
          )}, ${Math.round(ship.location[1])}]!`,
          garbleAmount,
        )}"`,
    },
    surrender: {
      send: ({ ship, equipment, powerUse, yesPercent, effectiveRange }) =>
        `${Math.round(
          yesPercent * 100,
        )}% of the available crew members agree, so you command your ship's ${
          equipment.displayName
        } to raise the proverbial white flag. A signal of your ship's surrender has been broadcast to any ship within ${
          Math.round(effectiveRange * 10) / 10
        } ${process.env.DISTANCE_UNIT}. This action uses ⚡️${powerUse} ${
          process.env.POWER_UNIT
        } of power.`,
      receive: (ship, garbleAmount = 0) =>
        `Your ship's antenna picks up a broadcast: "${garble(
          `We, of the ship ${ship.name}, do hereby surrender.`,
          garbleAmount,
        )}"`,
    },
    faction: {
      send: ({ ship, equipment, powerUse, yesPercent, effectiveRange }) =>
        `${Math.round(
          yesPercent * 100,
        )}% of the available crew members agree, so you hit the big ${
          ship.faction.color
        } button on your control panel. Your ship's ${
          equipment.displayName
        } vibrates in time with your faction's anthem. A rallying cry for ${
          ship.faction.emoji
        }${ship.faction.name} echoes across space to any ship within ${
          Math.round(effectiveRange * 10) / 10
        } ${process.env.DISTANCE_UNIT}! This action uses ⚡️${powerUse} ${
          process.env.POWER_UNIT
        } of power.`,
      receive: (ship, garbleAmount = 0) =>
        `Your ship's antenna picks up a broadcast: "${garble(
          `Members of ${ship.faction.name}! The crew of ${ship.name} calls out to you!`,
          garbleAmount,
        )}"`,
    },
    attack: {
      send: ({ ship, equipment, powerUse, yesPercent, effectiveRange }) =>
        `${Math.round(
          yesPercent * 100,
        )}% of the available crew members agree, so you hit the button on your control panel marked with a skull and crossbones. You grin as your ship's ${
          equipment.displayName
        } broadcasts your avarice. An attack signal makes its way to any ship within ${
          Math.round(effectiveRange * 10) / 10
        } ${process.env.DISTANCE_UNIT}! This action uses ⚡️${powerUse} ${
          process.env.POWER_UNIT
        } of power.`,
      receive: (ship, garbleAmount = 0) =>
        `Your ship's antenna picks up a broadcast: "${garble(
          `We of ${ship.name} declare an attack! Prepare to die, scum!`,
          garbleAmount,
        )}"`,
    },
  },
  jettison: {
    votePassed: (yesPercent, cargo, amount) =>
      `${Math.round(
        yesPercent * 100,
      )}% of the available crew members agree, so you hit the trash-can-shaped button on your controls. You watch out of the window as ${amount.toFixed(
        2,
      )} ${process.env.WEIGHT_UNIT_PLURAL} of ${
        cargo.displayName
      } goes drifting off into space.`,
    message: {
      peace: () => `A token of peace.`,
      forYou: () => `Enjoy!`,
      nowYou: () => `Now it's your turn.`,
      gotcha: () => `Seeya, suckers!`,
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
  buy: {
    notEnoughMoney: () =>
      `"Damn," you say as you turn your credits onto the counter. "I thought we had enough to pay for this, but I guess we don't..." You shrug and return to shopping.`,
    equipment: {
      voteFailed: (part, cost) =>
        `The crew decides collectively not to buy a ${part.emoji}${part.displayName} for \`💳${cost}\` credits.`,
      votePassed: (part, cost) =>
        `You bought a brand new ${part.emoji} ${
          part.displayName
        }! It cost you \`💳${cost}\` credits, but it looks very nice and shiny as your crew gets to work installing ${
          part.type === 'chassis'
            ? `all of your equipment in it.`
            : 'it in its housing.'
        }`,
    },
  },
  sell: {
    equipment: (part, credits) =>
      `You've sold your ${part.emoji}${part.displayName} for \`💳${credits}\` credits.`,
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
  planet: {
    otherShipLand: (ship) =>
      `The ship ${ship.name} has docked on ${ship.status.docked}.`,
    otherShipLeave: (ship, planet) =>
      `The ship ${ship.name} has departed from ${planet.name}.`,
  },
  vote: {
    insufficientVotes: () =>
      `Not enough eligible crew members voted, and you don't feel comfortable making such an important decision without getting everyone's input. You decide to hold off for now.`,
  },
  attack: {
    tooSoon: (untilNext) =>
      `Your ship's weapons are still recharging! You can attack again in ${untilNext}.`,
    voteFailed: () =>
      `The crew decides collectively that attacking isn't the smartest move right now. A few sighs of relief are heard around the bridge.`,
    noWeapon: () => `Your ship has no weapons to attack with!`,
    noShips: () => `There are no ships in range to attack.`,
    brokenWeapons: () =>
      `All of your weapons are too damaged to attack with! Repair them first!`,
    tooLowMunitionsSkill: (required, current, weapon) =>
      `Voters' collective munitions skill (\`${current}\`), is too low to operate the ${weapon.emoji} ${weapon.displayName} (requires \`${required}\`).`,
    docked: (enemyShip) =>
      `Just as you train your sights on the enemy, they manage to slip inside the protective field of ${capitalize(
        enemyShip.status.docked,
      )}. Your prey has made it to safety... for now.`,
    votePassed: (yesPercent, otherShip, collectiveMunitionsSkill) =>
      `${Math.round(
        yesPercent * 100,
      )}% of the available crew members agree to launch an attack against ${
        otherShip.name
      }! The participating crew members take their places at their battle stations with a collective munitions skill of \`${collectiveMunitionsSkill}\`.`,
    outOfRange: () =>
      `By the time you got your weapons ready, the other ship had moved out of range! You'll have to catch up to attack them.`,
    miss: (weapon, wasClose, accuracyMultiplier) =>
      `The attack from your ${weapon.emoji} ${weapon.displayName} misses${
        wasClose ? " by a hair's breadth" : ''
      }! ${
        accuracyMultiplier > 1
          ? `Even though our munitions experts were in peak condition, it wasn't enough.`
          : accuracyMultiplier < 1
          ? `The opposition's pilots are better than expected, and due to some brilliant flying, the attack bore wide.`
          : `All those watching from the bridge confirm: it was a lucky dodge by the enemy.`
      }`,
    hit: (weapon, advantageDamageMultiplier, totalDamageDealt, destroyedShip) =>
      `Your ${weapon.emoji} ${weapon.displayName} hits the enemy, dealing ${
        Math.round(totalDamageDealt * 10) / 10
      } damage${
        advantageDamageMultiplier > 1
          ? `, a critical hit!`
          : advantageDamageMultiplier < 1
          ? ` in a glancing blow.`
          : '.'
      }${destroyedShip ? ` You destroyed their ship!` : ''}`,
  },
  defend: {
    miss: (attacker, weapon, accuracyMultiplier) =>
      `A ${weapon.emoji} ${
        weapon.displayName
      } attack whizzes past your craft, coming from the ship ${
        attacker.name
      }. ${
        accuracyMultiplier > 1
          ? `They appear to be expert shots, and you wonder how long you can stay lucky...`
          : accuracyMultiplier < 1
          ? `Thanks to the quick action of your pilots, the shot went fairly wide.`
          : `It looks like a tight battle is unfolding.`
      }`,
    hit: (attacker, weapon, advantageDamageMultiplier, totalDamageTaken) =>
      `The ${weapon.emoji} ${weapon.displayName} of ${
        attacker.name
      } hits your ship for ${Math.round(totalDamageTaken * 10) / 10} damage${
        advantageDamageMultiplier > 1
          ? ` in a critical hit!`
          : advantageDamageMultiplier < 1
          ? ` in a glancing blow.`
          : '.'
      }`,
    advice: () =>
      `Repair equipment and train pilots to increase your dodge chance, drop cargo to increase your speed, and train munitions experts to better fight back!`,
  },
  move: {
    oob: {
      reEnter: () => `Your ship has reentered known space.`,
      goOOB: () =>
        `Your ship has left the realms of known space. There's nothing but the void to be found out here.`,
    },
    redirect: {
      success: (degrees, arrow, voteCount) =>
        `With ${voteCount} vote${
          voteCount === 1 ? '' : 's'
        }, your ship rotates to face ${arrow} ${degrees} degrees.`,
    },
    adjustSpeed: {
      success: (spedUp, newSpeed, speedPercent, voteCount) =>
        `With ${voteCount} vote${voteCount === 1 ? '' : 's'}, your ship ${
          spedUp ? 'speeds up' : 'slows down'
        } to ${newSpeed}${process.env.SPEED_UNIT}, which is ${Math.round(
          speedPercent * 100,
        )}% of its maximum power.`,
    },
  },
  land: {
    voteFailed: () => `The crew decides collectively not to land here.`,
    votePassed: (yesPercent, planet) =>
      `${Math.round(
        yesPercent * 100,
      )}% of the available crew members agree to land on ${planet.name}.`,
    recharge: () =>
      `The friendly crew at the dock refills your batteries, on the house.`,
    depart: (planet) =>
      `Your crew packs aboard the ship as the engines heat up. Clouds of smoke hide the launchpad as you lift off from ${
        planet.name
      } at ${Math.ceil(Math.random() * 23)}:00 sharp.`,
  },
  log: {
    empty: () =>
      `Looks like there's nothing in your log yet. Explore the galaxy to discover things!`,
  },
  interact: {
    nothing: () => `There's nothing close enough to you to interact with.`,
  },
  discovery: {
    planet: (planet) =>
      `You've discovered ${planet.name}, a ${planet.getSizeDescriptor()} ${
        planet.color
      } planet located at [${planet.location.join(', ')}] ${
        process.env.DISTANCE_UNIT
      }. It has been added to your galaxy map. Congratulations!`,
  },
}
