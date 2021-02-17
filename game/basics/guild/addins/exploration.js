const story = require('../../story/story')

module.exports = (guild) => {
  guild.ship.getMap = () => {
    let mapString = ''
    if (!(guild.ship.seen?.planets || []).length) mapString = story.map.empty()
    else {
      mapString = 'Planets discovered so far:\n';
(guild.ship.seen?.planets || []).forEach((planetName) => {
        const planetData = guild.context.planets.find(
          (p) => p.name === planetName
        )
        mapString += `${planetData.name} - [${planetData.location}]\n`
      })
    }
    return { ok: true, message: mapString }
  }
}
