const runGuildCommand = require(`../../../../discord/actions/runGuildCommand`)
const story = require(`../../story/story`)
const {
  capitalize,
  captainTag,
  usageTag,
  getUnitVectorBetween,
  angle,
  degreesToUnitVector,
} = require(`../../../../common`)
const depart = require(`../../../../discord/actions/depart`)

module.exports = (guild) => {
  guild.ship.land = ({ planet }) => {
    guild.ship.status.docked = planet.name
    const unitVectorFromPlanetToShip = getUnitVectorBetween(planet, guild.ship),
      landingLocation = unitVectorFromPlanetToShip.map(
        (v) => (v * planet.radius) / KM_PER_AU,
      )
    guild.ship.location = landingLocation
    guild.ship.velocity = [0, 0]

    if (planet.recharge && guild.ship.power < guild.ship.maxPower()) {
      guild.ship.power = guild.ship.maxPower()
      setTimeout(() => guild.message(story.land.recharge()), 1000) // send after landing message
    }
    guild.saveToDb()

    const otherDockedShips = planet
      .getDockedShips()
      .filter((s) => s.id !== guild.id)
    otherDockedShips.forEach((s) =>
      s.message(story.planet.otherShipLand(guild.ship)),
    )

    runGuildCommand({
      commandTag: `planet`,
      guild,
    })
    return {
      ok: true,
      message: story.land.generalPlanet(guild.ship, planet),
    }
  }

  guild.ship.depart = ({ planet, msg }) => {
    const otherDockedShips = planet
      .getDockedShips()
      .filter((s) => s.id !== guild.id)
    otherDockedShips.forEach((s) =>
      s.message(story.planet.otherShipLeave(guild.ship, planet)),
    )

    guild.ship.status.docked = ``
    const startLocation = [...guild.ship.location]
    const vectorFromPlanet = degreesToUnitVector(angle(planet, guild.ship))
    const locationOffset = 0.0005
    const boostAmount = 0.000001
    guild.ship.location = [
      startLocation[0] + vectorFromPlanet[0] * locationOffset,
      startLocation[1] + vectorFromPlanet[1] * locationOffset,
    ]
    guild.ship.velocity = [
      vectorFromPlanet[0] * boostAmount,
      vectorFromPlanet[1] * boostAmount,
    ]
    guild.saveToDb()

    runGuildCommand({
      commandTag: `ship`,
      guild,
      author: msg.author,
      props: { guild },
    })

    return {
      ok: true,
      message: story.depart.depart(planet),
    }
  }

  guild.ship.getPlanetFields = (planet) => {
    const fields = []
    fields.push({
      name: `📍 Location`,
      value:
        planet.location.map((l) => l.toFixed(2)).join(`, `) +
        ` ` +
        DISTANCE_UNIT,
    })
    fields.push({
      name: `📏 Size`,
      value: capitalize(planet.getSizeDescriptor()),
    })
    fields.push({
      name: `🎨 Color`,
      value: capitalize(planet.color),
    })
    const dockedShips = planet.getDockedShips()
    fields.push({
      name: `🛸 Docked Ships`,
      value:
        dockedShips.length < 5
          ? dockedShips.map((s) => s.ship.name).join(`, `)
          : dockedShips.length,
    })
    fields.push({
      name: `💳  Your Credits`,
      value: Math.round(guild.ship.credits),
    })
    return fields
  }

  guild.ship.getPlanetActions = (planet) => {
    const actions = []

    actions.push({
      emoji: `🛠`,
      label: `Shipyard`,
      async action({ user, msg, guild }) {
        await runGuildCommand({
          commandTag: `shipyard`,
          author: user,
          msg,
        })
      },
    })

    actions.push({
      emoji: `⚖️`,
      label: `Merchant Quarter`,
      async action({ user, msg, guild }) {
        await runGuildCommand({
          commandTag: `merchant`,
          author: user,
          msg,
        })
      },
    })

    // actions.push({
    //   emoji: '💰',
    //   label: 'Bank',
    //   async action({ user, msg, guild }) {
    //     // await runGuildCommand({
    //     //   commandTag: 'scanShip',
    //     //   author: user,
    //     //   msg,
    //     //   props: { otherShip, guild },
    //     // })
    //   },
    // })

    actions.push({
      emoji: `🛫`,
      label: `Start Leave Vote ` + usageTag(0, `poll`),
      async action({ user, msg, guild, planet }) {
        depart({ msg, guild, planet })
      },
    })

    return actions
  }
}
