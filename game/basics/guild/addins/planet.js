const runGuildCommand = require(`../../../../discord/actions/runGuildCommand`)
const story = require(`../../story/story`)
const { capitalize, captainTag, usageTag } = require(`../../../../common`)
const depart = require(`../../../../discord/actions/depart`)

module.exports = (guild) => {
  guild.ship.land = ({ planet, msg }) => {
    guild.ship.status.docked = planet.name
    guild.ship.location = [...planet.location]
    guild.ship.bearing = [0, 0]

    if (planet.recharge && guild.ship.power < guild.ship.maxPower()) {
      guild.ship.power = guild.ship.maxPower()
      setTimeout(() => guild.pushToGuild(story.land.recharge(), msg), 1000) // send after landing message
    }

    const otherDockedShips = planet
      .getDockedShips()
      .filter((s) => s.id !== guild.id)
    otherDockedShips.forEach((s) =>
      s.pushToGuild(story.planet.otherShipLand(guild.ship)),
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
      s.pushToGuild(story.planet.otherShipLeave(guild.ship, planet)),
    )

    guild.ship.status.docked = ``

    runGuildCommand({
      commandTag: `ship`,
      guild,
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
