const {
  capitalize,
  bearingToDegrees,
  bearingToArrow,
  percentToTextBars,
  numberToEmoji,
  msToTimeString,
  usageTag,
} = require(`../../../../common`)
const runGuildCommand = require(`../../../../discord/actions/runGuildCommand`)

module.exports = (guild) => {
  guild.ship.canInteract = () => {
    if (guild.ship.status.docked) return false
    const interactableThings = {
      guilds: guild.context.scanArea({
        x: guild.ship.location[0],
        y: guild.ship.location[1],
        range: guild.ship.maxActionRadius(),
        excludeIds: guild.id,
      }).guilds,
      caches: guild.context.scanArea({
        x: guild.ship.location[0],
        y: guild.ship.location[1],
        range: guild.ship.tractorRadius(),
        excludeIds: guild.id,
      }).caches,
      planets: guild.context.scanArea({
        x: guild.ship.location[0],
        y: guild.ship.location[1],
        range:
          guild.ship.equipment.chassis[0].interactRadius,
        excludeIds: guild.id,
      }).planets,
    }
    return (
      interactableThings.guilds.length +
        interactableThings.planets.length +
        interactableThings.caches.length >
      0
    )
  }

  guild.ship.getShipActions = () => {
    const actions = []

    if (guild.ship.canInteract()) {
      actions.push({
        emoji: `👉`,
        label: `See/Interact With Nearby Objects`,
        async action({ user, msg }) {
          await runGuildCommand({
            msg,
            commandTag: `nearby`,
          })
        },
      })
    }

    actions.push({
      emoji: `🕹`,
      label: `Flight Deck`,
      async action({ user, msg }) {
        await runGuildCommand({
          msg,
          commandTag: `flightDeck`,
        })
      },
    })

    actions.push({
      emoji: `🎛`,
      label: `Main Deck`,
      async action({ user, msg }) {
        await runGuildCommand({
          msg,
          commandTag: `mainDeck`,
        })
      },
    })

    actions.push({
      emoji: `👨‍👩‍👧‍👧`,
      label: `Crew Quarters`,
      async action({ user, msg }) {
        await runGuildCommand({
          msg,
          commandTag: `crewQuarters`,
        })
      },
    })

    actions.push({
      emoji: `🌐`,
      label: `Holo Deck`,
      async action({ user, msg }) {
        await runGuildCommand({
          msg,
          commandTag: `holoDeck`,
        })
      },
    })

    return actions
  }

  guild.ship.statusReport = async () => {
    const fields = []
    const actions = await guild.ship.getShipActions()

    const fuel = guild.ship.cargo.find(
      (c) => c.type === `fuel`,
    ).amount

    if (!guild.ship.status.docked) {
      fields.push({
        name: `⏩ Speed`,
        value: guild.ship.status.stranded
          ? `Out of Fuel!`
          : guild.ship.speed
          ? guild.ship.speed.toFixed(2) + ` ` + SPEED_UNIT
          : `Stopped`,
      })

      fields.push({
        name: `🧭 Bearing`,
        value:
          bearingToArrow(guild.ship.bearing) +
          ` ` +
          bearingToDegrees(guild.ship.bearing).toFixed(0) +
          ` degrees`,
      })
    } else {
      const dockedPlanet = guild.context.planets.find(
        (p) => p.name === guild.ship.status.docked,
      )
      fields.push({
        name: `Docked at:`,
        value: `🪐 ` + dockedPlanet.name,
      })
    }

    fields.push({
      name: `📍 Location`,
      value:
        guild.ship.location
          .map((l) => l.toFixed(2))
          .join(`, `) +
        ` ` +
        DISTANCE_UNIT,
    })

    const currentHp = guild.ship.currentHp()
    const maxHp = guild.ship.maxHp()
    fields.push({
      name: `🇨🇭 Health`,
      value:
        percentToTextBars(currentHp / maxHp) +
        `\n` +
        `${Math.round(currentHp)}/${Math.round(
          maxHp,
        )} ${HEALTH_UNIT}`,
    })

    fields.push({
      name: `⛽️ Fuel`,
      value:
        fuel.toFixed(1) +
        ` ` +
        WEIGHT_UNITS +
        (guild.ship.speed
          ? `\n(${Math.floor(
              fuel / guild.ship.fuelUsePerTick(),
            )} ${TIME_UNITS} at\ncurrent speed)`
          : ``),
    })

    fields.push({
      name: `⚡️Power`,
      value:
        percentToTextBars(
          guild.ship.power / guild.ship.maxPower(),
        ) +
        `\n` +
        guild.ship.power.toFixed(1) +
        `/` +
        guild.ship.maxPower().toFixed(1) +
        POWER_UNIT +
        ` (${Math.round(
          (guild.ship.power / guild.ship.maxPower() || 0) *
            100,
        )}%)`,
    })

    fields.push({
      name: `⏱ Next Tick`,
      value:
        msToTimeString(guild.context.timeUntilNextTick()) +
        ` (real-time)`,
    })

    return {
      headline: ``, // `All systems normal.`, // todo
      fields,
      actions,
    }
  }

  guild.ship.shipInfo = () => {
    const fields = []
    const actions = []

    fields.push({
      name: `Chassis`,
      value:
        guild.ship.equipment.chassis[0].emoji +
        guild.ship.equipment.chassis[0].displayName,
    })

    const captain = guild.ship.captain
    fields.push({
      name: `👩‍✈️ Captain`,
      value: captain
        ? `%username%${captain}%`
        : `No captain`,
    })

    fields.push({
      name: `👵🏽 Age`,
      value:
        (
          (Date.now() - guild.ship.launched) *
          REAL_TIME_TO_GAME_TIME_MULTIPLIER *
          TIME_UNIT_LONGS_MULTIPLIER
        ).toFixed(2) +
        ` ` +
        TIME_UNIT_LONGS,
    })

    fields.push({
      name: `👩‍👩‍👧‍👦 Crew`,
      value: guild.ship.members.length + ` members`,
    })

    if (guild.faction && guild.faction.color) {
      fields.push({
        name: `Faction`,
        value: guild.faction.emoji + guild.faction.name,
      })
    }

    fields.push({
      name: `👉 Interact Range`,
      value:
        guild.ship.equipment.chassis[0].interactRadius +
        ` ` +
        DISTANCE_UNIT,
    })

    fields.push({
      name: `🎒 Ship Weight`,
      value:
        percentToTextBars(
          guild.ship.getTotalWeight() /
            guild.ship.equipment.chassis[0].maxWeight,
        ) +
        `\n` +
        Math.round(guild.ship.getTotalWeight()) +
        `/` +
        Math.round(
          guild.ship.equipment.chassis[0].maxWeight,
        ) +
        ` ` +
        WEIGHT_UNITS,
    })

    fields.push({
      name: `🏎 Max Speed`,
      value:
        guild.ship.maxSpeed().toFixed(2) +
        ` ` +
        DISTANCE_UNIT +
        `/` +
        TIME_UNIT +
        `\n` +
        `(At current weight)`,
    })

    actions.push({
      emoji: `🔩`,
      label: `Equipment`,
      async action({ user, msg }) {
        await runGuildCommand({
          msg,
          author: user,
          commandTag: `equipment`,
        })
      },
    })
    actions.push({
      emoji: `🏆`,
      label: `Crew Rankings`,
      async action({ user, msg }) {
        await runGuildCommand({
          msg,
          author: user,
          commandTag: `rankings`,
        })
      },
    })
    actions.push({
      emoji: `🧾`,
      label: `Ship Log`,
      async action({ user, msg }) {
        await runGuildCommand({
          msg,
          author: user,
          commandTag: `log`,
        })
      },
    })

    return {
      fields,
      actions,
    }
  }
}
