const runGuildCommand = require('../../../../discord/actions/runGuildCommand')
const story = require('../../story/story')
const { capitalize } = require('../../../../common')

module.exports = (guild) => {
  guild.ship.land = ({ planet, msg }) => {
    guild.ship.status.docked = planet.name
    guild.ship.location = [...planet.location]

    if (planet.recharge && guild.ship.power < guild.ship.maxPower()) {
      guild.ship.power = guild.ship.maxPower()
      setTimeout(() => guild.pushToGuild(story.land.recharge(), msg), 1000) // send after landing message
    }

    const otherDockedShips = planet
      .getDockedShips()
      .filter((s) => s.guildId !== guild.guildId)
    otherDockedShips.forEach((s) =>
      s.pushToGuild(story.planet.otherShipLand(guild.ship)),
    )

    runGuildCommand({
      msg,
      commandTag: 'planet',
      author: msg.author,
      guild,
    })
  }

  guild.ship.depart = ({ msg }) => {
    guild.ship.status.docked = false

    runGuildCommand({
      msg,
      commandTag: 'ship',
      author: msg.author,
      guild,
    })
  }

  guild.ship.getPlanetFields = (planet) => {
    const fields = []
    fields.push({
      name: `📍 Location`,
      value:
        planet.location.map((l) => l.toFixed(2)).join(', ') +
        ' ' +
        process.env.DISTANCE_UNIT,
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
      value: dockedShips.length,
    })
    fields.push({
      name: `💳 Your Credits`,
      value: Math.round(guild.ship.credits),
    })
    return fields
  }

  guild.ship.getPlanetActions = (planet) => {
    const actions = []

    actions.push({
      emoji: '🛠',
      label: 'Shipyard',
      async action({ user, msg, guild }) {
        await runGuildCommand({
          commandTag: 'shipyard',
          author: user,
          msg,
        })
      },
    })

    actions.push({
      emoji: '⚖️',
      label: 'Merchant Quarter',
      async action({ user, msg, guild }) {
        // await runGuildCommand({
        //   commandTag: 'scanShip',
        //   author: user,
        //   msg,
        //   props: { otherShip, guild },
        // })
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
      emoji: '🛫',
      label: 'Leave',
      async action({ user, msg, guild, planet }) {
        const otherDockedShips = planet
          .getDockedShips()
          .filter((s) => s.guildId !== guild.guildId)
        otherDockedShips.forEach((s) =>
          s.pushToGuild(story.planet.otherShipLeave(guild.ship)),
        )

        guild.ship.status.docked = false
        guild.pushToGuild(story.land.depart(planet), msg)

        await runGuildCommand({
          commandTag: 'ship',
          author: user,
          msg,
          props: { guild },
        })
      },
    })

    return actions
  }
}
